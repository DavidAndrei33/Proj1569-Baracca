import { redis } from "./redis.js";
import { logger } from "./logger.js";

export const ORDER_EVENTS_CHANNEL = "order:events";

export interface OrderEvent {
  type: "ORDER_CREATED" | "ORDER_STATUS_CHANGED" | "RESERVATION_CREATED" | "RESERVATION_UPDATED";
  orderId?: number;
  reservationId?: number;
  status?: string;
  timestamp: string;
  data?: any;
}

export async function publishOrderEvent(event: OrderEvent): Promise<void> {
  try {
    await redis.publish(ORDER_EVENTS_CHANNEL, JSON.stringify(event));
  } catch (err) {
    logger.error({ err, event }, "Failed to publish order event");
  }
}

export function subscribeToOrderEvents(
  callback: (event: OrderEvent) => void
): () => void {
  const subscriber = redis.duplicate();

  subscriber.subscribe(ORDER_EVENTS_CHANNEL, (err) => {
    if (err) {
      logger.error({ err }, "Failed to subscribe to order events");
    } else {
      logger.debug("Subscribed to order events");
    }
  });

  subscriber.on("message", (_channel: string, message: string) => {
    try {
      const event = JSON.parse(message) as OrderEvent;
      callback(event);
    } catch (err) {
      logger.error({ err, message }, "Failed to parse order event");
    }
  });

  return () => {
    subscriber.unsubscribe(ORDER_EVENTS_CHANNEL);
    subscriber.quit();
  };
}
