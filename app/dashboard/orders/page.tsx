import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/authCookie";
import prisma from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PayOrderButton } from "@/components/participant/pay-order";
import { format } from "date-fns";

const ORDER_STATUS_STYLE: Record<string, string> = {
  PENDING_PAYMENT: "bg-amber-500/15 text-amber-700",
  PAYMENT_SUBMITTED: "bg-blue-600/15 text-blue-700",
  VERIFIED: "bg-green-600/15 text-green-700",
  REJECTED: "bg-red-600/15 text-red-700",
};

export default async function OrdersPage() {
  const session = await getAuthSession();
  if (!session) redirect("/auth/signin");

  const orders = await prisma.order.findMany({
    where: { userId: session.id },
    include: {
      orderItems: {
        include: {
          event: { select: { id: true, name: true, type: true } },
          Team: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">
          Your checkouts and payment statuses.
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No orders yet</CardTitle>
            <CardDescription>
              Add events to your cart and check out to create an order.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base">
                    Order · {format(order.createdAt, "MMM d, yyyy h:mm a")}
                  </CardTitle>
                  <CardDescription>
                    ₹{order.totalAmount.toString()} ·{" "}
                    {order.orderItems.map((i) => i.event.name).join(", ")}
                    {order.rejectionReason && (
                      <span className="mt-1 block text-red-600">
                        Rejected: {order.rejectionReason}
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={ORDER_STATUS_STYLE[order.status]}>
                    {order.status.replaceAll("_", " ")}
                  </Badge>
                  {order.status === "PENDING_PAYMENT" && (
                    <PayOrderButton
                      orderId={order.id}
                      amount={Number(order.totalAmount)}
                    />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="divide-y rounded-lg border text-sm">
                {order.orderItems.map((item) => (
                  <li key={item.id} className="flex items-center justify-between px-3 py-2">
                    <span>
                      {item.event.name}
                      {item.Team?.name ? (
                        <span className="text-muted-foreground"> · {item.Team.name}</span>
                      ) : null}
                    </span>
                    <span className="font-medium">₹{item.price.toString()}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}