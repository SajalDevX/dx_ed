import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { config } from '../config/index.js';
import { Course } from '../models/Course.js';
import { Order } from '../models/Order.js';
import { Enrollment } from '../models/Enrollment.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

// Only initialize Stripe if API key is provided and not empty
let stripe: Stripe | null = null;
if (config.stripe.secretKey && config.stripe.secretKey.length > 0) {
  stripe = new Stripe(config.stripe.secretKey, {
    apiVersion: '2025-02-24.acacia',
  });
}

const getStripe = (): Stripe => {
  if (!stripe) {
    throw ApiError.internal('Payment system not configured. Please add Stripe API keys.');
  }
  return stripe;
};

// Create checkout session for course purchase
export const createCheckoutSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stripeClient = getStripe();
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      throw ApiError.notFound('Course not found');
    }

    if (course.pricing.type === 'free') {
      throw ApiError.badRequest('This is a free course');
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: req.userId,
      course: courseId,
    });

    if (existingEnrollment) {
      throw ApiError.conflict('Already enrolled in this course');
    }

    // Get or create Stripe customer
    const user = await User.findById(req.userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    let customerId = user.subscription.stripeCustomerId;

    if (!customerId) {
      const customer = await stripeClient.customers.create({
        email: user.email,
        name: user.fullName,
        metadata: {
          userId: user._id.toString(),
        },
      });
      customerId = customer.id;
      user.subscription.stripeCustomerId = customerId;
      await user.save();
    }

    // Create checkout session
    const session = await stripeClient.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: course.pricing.currency.toLowerCase(),
            product_data: {
              name: course.title,
              description: course.shortDescription,
              images: course.thumbnail ? [course.thumbnail] : [],
            },
            unit_amount: Math.round(course.pricing.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${config.frontendUrl}/courses/${course.slug}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.frontendUrl}/courses/${course.slug}?canceled=true`,
      metadata: {
        userId: req.userId!,
        courseId: courseId,
        type: 'course_purchase',
      },
    });

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Plan to Stripe Price ID mapping
// IMPORTANT: Replace these with your actual Stripe Price IDs from Stripe Dashboard
const PLAN_PRICE_IDS: Record<string, string> = {
  hero: process.env.STRIPE_HERO_PRICE_ID || 'price_XXXXX', // Replace with actual Price ID
  guild: process.env.STRIPE_GUILD_PRICE_ID || 'price_XXXXX', // Replace with actual Price ID
};

// Create subscription checkout
export const createSubscriptionCheckout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stripeClient = getStripe();
    const { plan } = req.body;

    if (!plan || !PLAN_PRICE_IDS[plan]) {
      throw ApiError.badRequest('Invalid plan specified');
    }

    const priceId = PLAN_PRICE_IDS[plan];

    const user = await User.findById(req.userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    let customerId = user.subscription.stripeCustomerId;

    if (!customerId) {
      const customer = await stripeClient.customers.create({
        email: user.email,
        name: user.fullName,
        metadata: {
          userId: user._id.toString(),
        },
      });
      customerId = customer.id;
      user.subscription.stripeCustomerId = customerId;
      await user.save();
    }

    const session = await stripeClient.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${config.frontendUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.frontendUrl}/pricing?canceled=true`,
      metadata: {
        userId: req.userId!,
        plan,
        type: 'subscription',
      },
    });

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Handle Stripe webhook
export const handleWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stripeClient = getStripe();
    const sig = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;

    try {
      event = stripeClient.webhooks.constructEvent(
        req.body,
        sig,
        config.stripe.webhookSecret
      );
    } catch (err) {
      logger.error('Webhook signature verification failed:', err);
      throw ApiError.badRequest('Webhook signature verification failed');
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        logger.info(`Invoice paid: ${invoice.id}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        logger.warn(`Invoice payment failed: ${invoice.id}`);
        break;
      }

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};

// Handle successful checkout
async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const { userId, courseId, type } = session.metadata || {};

  if (type === 'course_purchase' && userId && courseId) {
    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      logger.error('User or course not found for checkout:', { userId, courseId });
      return;
    }

    const order = await Order.create({
      user: userId,
      items: [
        {
          type: 'course',
          itemId: courseId,
          title: course.title,
          price: course.pricing.price,
          discount: 0,
        },
      ],
      pricing: {
        subtotal: course.pricing.price,
        discount: 0,
        tax: 0,
        total: course.pricing.price,
        currency: course.pricing.currency,
      },
      payment: {
        provider: 'stripe',
        stripePaymentIntentId: session.payment_intent as string,
        status: 'succeeded',
        paidAt: new Date(),
      },
      billing: {
        name: user.fullName,
        email: user.email,
      },
      status: 'completed',
    });

    await Enrollment.create({
      user: userId,
      course: courseId,
      payment: {
        orderId: order._id,
        amount: course.pricing.price,
        method: 'stripe',
      },
    });

    course.stats.enrollments += 1;
    await course.save();

    logger.info(`Course enrollment created for user ${userId} in course ${courseId}`);
  }
}

// Handle subscription update
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const user = await User.findOne({ 'subscription.stripeCustomerId': customerId });
  if (!user) {
    logger.error('User not found for subscription:', customerId);
    return;
  }

  user.subscription.stripeSubscriptionId = subscription.id;
  user.subscription.status = subscription.status as 'active' | 'canceled' | 'past_due' | 'trialing';
  user.subscription.currentPeriodStart = new Date(subscription.current_period_start * 1000);
  user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);

  const priceId = subscription.items.data[0]?.price.id;
  if (priceId) {
    user.subscription.plan = 'premium';
  }

  await user.save();
  logger.info(`Subscription updated for user ${user._id}`);
}

// Handle subscription canceled
async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const user = await User.findOne({ 'subscription.stripeCustomerId': customerId });
  if (!user) {
    logger.error('User not found for subscription cancellation:', customerId);
    return;
  }

  user.subscription.status = 'canceled';
  user.subscription.plan = 'free';
  await user.save();

  logger.info(`Subscription canceled for user ${user._id}`);
}

// Get user orders
export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orders = await Order.find({ user: req.userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { orders },
    });
  } catch (error) {
    next(error);
  }
};

// Get subscription status
export const getSubscriptionStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    res.json({
      success: true,
      data: {
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Cancel subscription
export const cancelSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stripeClient = getStripe();
    const user = await User.findById(req.userId);

    if (!user || !user.subscription.stripeSubscriptionId) {
      throw ApiError.notFound('No active subscription found');
    }

    await stripeClient.subscriptions.cancel(user.subscription.stripeSubscriptionId);

    res.json({
      success: true,
      message: 'Subscription canceled successfully',
    });
  } catch (error) {
    next(error);
  }
};
