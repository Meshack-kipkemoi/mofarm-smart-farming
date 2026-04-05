// @/components/emails/order-confirmation.tsx
import { contactInfo } from "@/data/contact";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Text,
  Heading,
  Button,
  Img,
  Hr,
  Link,
  Preview,
} from "@react-email/components";

// Dummy data for type definitions
interface EnrichedCartItem {
  product: {
    id: string;
    name: string;
    price: number;
    image?: string;
  };
  quantity: number;
}

interface OrderConfirmationEmailProps {
  orderId?: string;
  customerName?: string;
  email?: string;
  phone?: string;
  address?: string;
  items?: EnrichedCartItem[];
  totalPrice?: number;
  transactionId?: string;
  orderDate?: string;
}

// Dummy data constants
const DUMMY_ITEMS: EnrichedCartItem[] = [
  {
    product: {
      id: "1",
      name: "Organic Fertilizer - 50kg",
      price: 2500,
      image:
        "https://res.cloudinary.com/meshack-kipkemoi/image/upload/v1774801077/hero-fruits_zs58oz.jpg",
    },
    quantity: 2,
  },
  {
    product: {
      id: "2",
      name: "Hybrid Maize Seeds - 2kg",
      price: 1200,
      image:
        "https://res.cloudinary.com/meshack-kipkemoi/image/upload/v1774801077/hero-fruits_zs58oz.jpg",
    },
    quantity: 1,
  },
  {
    product: {
      id: "3",
      name: "Garden Sprayer - 16L",
      price: 3500,
      image:
        "https://res.cloudinary.com/meshack-kipkemoi/image/upload/v1774801077/hero-fruits_zs58oz.jpg",
    },
    quantity: 1,
  },
];

export const OrderConfirmationEmail = ({
  orderId = "ORD-2024-001",
  customerName = "John Doe",
  email = "customer@example.com",
  phone = "+254 712 345 678",
  address = "Nyeri Town, Stage 4, Near Total Petrol Station",
  items = DUMMY_ITEMS,
  totalPrice = 7200,
  orderDate = new Date().toLocaleDateString("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
}: OrderConfirmationEmailProps) => {
  const previewText = `Order Confirmation #${orderId.slice(0, 8)} - KSh ${totalPrice.toLocaleString()}`;

  return (
    <Html>
      <Head>
        <title>Order Confirmation</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Row>
              {/* Left spacer to visually center the logo+text group */}
              <Column style={{ width: "50%" }} />

              {/* Logo — fixed width matching the image */}
              <Column style={{ width: "40px", verticalAlign: "middle" }}>
                <Img
                  src="https://res.cloudinary.com/meshack-kipkemoi/image/upload/v1775420961/mofarm-logo_j2z5ev.png"
                  width="40"
                  height="40"
                  alt="MoFarm"
                  style={{ display: "block", borderRadius: "4px" }}
                />
              </Column>

              {/* Brand name — 8px gap via paddingLeft, lineHeight matches image height */}
              <Column style={{ verticalAlign: "middle", paddingLeft: "8px" }}>
                <Text
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#059669",
                    margin: "0",
                    lineHeight: "40px",
                    whiteSpace: "nowrap" as const,
                  }}
                >
                  Mofarm
                </Text>
              </Column>

              {/* Right spacer to balance */}
              <Column style={{ width: "50%" }} />
            </Row>
          </Section>
          {/* Hero Section */}
          <Section style={heroSection}>
            <Heading style={h1}>Order Confirmed!</Heading>
            <Text style={heroText}>
              Hi {customerName}, thank you for your order. We&apos;re preparing
              your items for delivery.
            </Text>
          </Section>

          {/* Order Details Box */}
          <Section style={detailsSection}>
            <Row>
              <Column style={detailColumn}>
                <Text style={detailLabel}>Order Number</Text>
                <Text style={detailValue}>
                  #{orderId.slice(0, 8).toUpperCase()}
                </Text>
              </Column>
              <Column style={detailColumn}>
                <Text style={detailLabel}>Order Date</Text>
                <Text style={detailValue}>{orderDate}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* Items Table */}
          <Section>
            <Heading as="h2" style={{ ...h2, padding: "0 32px" }}>
              Order Summary ({items.length} items)
            </Heading>

            {items.map((item) => (
              <Row key={item.product.id} style={itemRow}>
                <Column style={productColumn}>
                  <Img
                    src={item.product.image}
                    width="80"
                    height="80"
                    alt={item.product.name}
                    style={productImage}
                  />
                </Column>
                <Column style={detailsColumn}>
                  <Text style={productName}>{item.product.name}</Text>
                  <Text style={productQty}>Qty: {item.quantity}</Text>
                  <Text style={productPrice}>
                    KSh {(item.product.price * item.quantity).toLocaleString()}
                  </Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Hr style={hr} />

          {/* Totals */}
          <Section style={totalsSection}>
            <Row>
              <Column style={totalLabelColumn}>
                <Text style={totalLabel}>Subtotal</Text>
              </Column>
              <Column style={totalValueColumn}>
                <Text style={totalValue}>
                  KSh {totalPrice.toLocaleString()}
                </Text>
              </Column>
            </Row>
            <Row>
              <Column style={totalLabelColumn}>
                <Text style={totalLabel}>Delivery Fee</Text>
              </Column>
              <Column style={totalValueColumn}>
                <Text style={totalValue}>Free</Text>
              </Column>
            </Row>
            <Row>
              <Column style={totalLabelColumn}>
                <Text style={grandTotalLabel}>Total</Text>
              </Column>
              <Column style={totalValueColumn}>
                <Text style={grandTotalValue}>
                  KSh {totalPrice.toLocaleString()}
                </Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* Delivery Details */}
          <Section style={deliverySection}>
            <Heading as="h2" style={h2}>
              Delivery Details
            </Heading>
            <Row>
              <Column>
                <Text style={detailLabel}>Delivery Address</Text>
                <Text style={deliveryText}>{address}</Text>

                <Text style={{ ...detailLabel, marginTop: "16px" }}>
                  Contact Phone
                </Text>
                <Text style={deliveryText}>{phone}</Text>

                <Text style={{ ...detailLabel, marginTop: "16px" }}>Email</Text>
                <Text style={deliveryText}>{email}</Text>
              </Column>
            </Row>
          </Section>

          {/* CTA Button */}
          <Section style={ctaSection}>
            <Button href={`https://mofarm.co.ke//${orderId}`} style={button}>
              Track Your Order
            </Button>
          </Section>

          {/* Support Section */}
          <Section style={supportSection}>
            <Text style={supportText}>
              Need help? Contact us at{" "}
              <Link href="mailto:support@mofarm.co.ke" style={link}>
                support@mofarm.co.ke
              </Link>{" "}
              or call{" "}
              <Link href={contactInfo[0].href} style={link}>
                {contactInfo[0].value}
              </Link>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} MoFarm Smart Farming. All rights
              reserved.
              <br />
              Nyeri, Kenya
            </Text>
            <Text style={footerLinks}>
              <Link href="https://mofarm.co.ke/privacy" style={footerLink}>
                Privacy Policy
              </Link>{" "}
              •{" "}
              <Link href="https://mofarm.co.ke/terms" style={footerLink}>
                Terms of Service
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Email-safe styles (inline for maximum compatibility)
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
};

const header = {
  padding: "20px 32px",
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto",
};

const heroSection = {
  padding: "0 32px 20px",
  textAlign: "center" as const,
};

const h1 = {
  color: "#059669",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0 0 16px",
  lineHeight: "1.2",
};

const heroText = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0",
};

const detailsSection = {
  backgroundColor: "#f0fdf4",
  borderRadius: "8px",
  padding: "20px",
};

const detailColumn = {
  width: "33.33%",
  textAlign: "center" as const,
};

const detailLabel = {
  color: "#6b7280",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  margin: "0 0 4px",
};

const detailValue = {
  color: "#111827",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "24px 32px",
  borderStyle: "solid",
  borderWidth: "1px 0 0",
};

const h2 = {
  color: "#111827",
  fontSize: "18px",
  fontWeight: "600",
};

const itemRow = {
  padding: "16px 32px",
  borderBottom: "1px solid #f3f4f6",
};

const productColumn = {
  width: "80px",
  verticalAlign: "top" as const,
};

const productImage = {
  borderRadius: "8px",
  objectFit: "cover" as const,
};

const detailsColumn = {
  paddingLeft: "16px",
  verticalAlign: "top" as const,
};

const productName = {
  color: "#111827",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 4px",
};

const productQty = {
  color: "#6b7280",
  fontSize: "13px",
  margin: "0 0 4px",
};

const productPrice = {
  color: "#059669",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0",
};

const totalsSection = {
  padding: "0 32px",
};

const totalLabelColumn = {
  width: "50%",
};

const totalValueColumn = {
  width: "50%",
  textAlign: "right" as const,
};

const totalLabel = {
  color: "#6b7280",
  fontSize: "14px",
  margin: "0 0 8px",
};

const totalValue = {
  color: "#111827",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0 0 8px",
};

const grandTotalLabel = {
  color: "#111827",
  fontSize: "16px",
  fontWeight: "700",
  margin: "8px 0 0",
};

const grandTotalValue = {
  color: "#059669",
  fontSize: "18px",
  fontWeight: "700",
  margin: "8px 0 0",
};

const deliverySection = {
  padding: "0 32px",
};

const deliveryText = {
  color: "#374151",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "4px 0 0",
};

const ctaSection = {
  padding: "32px",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#059669",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 32px",
  border: "none",
};

const supportSection = {
  padding: "0 32px 24px",
  textAlign: "center" as const,
};

const supportText = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
};

const link = {
  color: "#059669",
  textDecoration: "underline",
};

const footer = {
  padding: "24px 32px 0",
  borderTop: "1px solid #e5e7eb",
  textAlign: "center" as const,
};

const footerText = {
  color: "#9ca3af",
  fontSize: "12px",
  lineHeight: "20px",
  margin: "0 0 8px",
};

const footerLinks = {
  color: "#9ca3af",
  fontSize: "12px",
  margin: "0",
};

const footerLink = {
  color: "#6b7280",
  textDecoration: "underline",
};

export default OrderConfirmationEmail;
