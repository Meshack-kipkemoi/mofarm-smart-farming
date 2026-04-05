import { Clock, LucideIcon, MapPin, Phone } from "lucide-react";

type ContactInfoItem = {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
  subtext?: string;
};

export const contactInfo: ContactInfoItem[] = [
  {
    icon: Phone,
    label: "Phone",
    value: "+254 703 946365",
    href: "tel:+254703946365",
    subtext: "Call or WhatsApp",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Nyeri, Kenya",
    subtext: "Central Highlands",
  },
  {
    icon: Clock,
    label: "Delivery Days",
    value: "Monday, Wednesday & Saturday",
    subtext: "Fresh delivery schedule",
  },
];
