import { OrderStatus } from "@prisma/client";

export const STATUS_FLOW: OrderStatus[] = [
  OrderStatus.RECEIVED,
  OrderStatus.ACCEPTED,
  OrderStatus.PREPARING,
  OrderStatus.READY,
  OrderStatus.PICKED_UP,
];

export const CANCELLABLE_STATUSES: OrderStatus[] = [
  OrderStatus.RECEIVED,
  OrderStatus.ACCEPTED,
  OrderStatus.PREPARING,
];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.RECEIVED]: "Primita",
  [OrderStatus.ACCEPTED]: "Acceptata",
  [OrderStatus.PREPARING]: "In preparare",
  [OrderStatus.READY]: "Gata de ridicare",
  [OrderStatus.PICKED_UP]: "Ridicata",
  [OrderStatus.CANCELLED]: "Anulata",
};

export function canTransition(
  from: OrderStatus,
  to: OrderStatus
): boolean {
  if (to === OrderStatus.CANCELLED) {
    return CANCELLABLE_STATUSES.includes(from);
  }

  const fromIndex = STATUS_FLOW.indexOf(from);
  const toIndex = STATUS_FLOW.indexOf(to);

  if (fromIndex === -1 || toIndex === -1) return false;
  return toIndex > fromIndex;
}

export function getNextStatus(current: OrderStatus): OrderStatus | null {
  const index = STATUS_FLOW.indexOf(current);
  if (index === -1 || index >= STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[index + 1];
}
