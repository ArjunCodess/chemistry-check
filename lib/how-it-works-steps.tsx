import { Download, Lightbulb, Upload } from "lucide-react";

export const steps = [
  {
    title: "Export your chat",
    description:
      "Export your conversation history from WhatsApp, Telegram, or Instagram.",
    icon: <Download className="w-12 h-12 text-primary-600" />,
  },
  {
    title: "Upload to ChemistryCheck",
    description: "Securely upload your chat file to our platform for analysis.",
    icon: <Upload className="w-12 h-12 text-primary-600" />,
  },
  {
    title: "Get insights",
    description:
      "Receive comprehensive analysis on your conversation patterns, sentiment, and relationship dynamics.",
    icon: <Lightbulb className="w-12 h-12 text-primary-600" />,
  },
];