export type Platform = "telegram" | "instagram" | "whatsapp";

export type InstructionStep = {
  label: string;
  description: string;
};

export const PLATFORM_INSTRUCTIONS: Record<Platform, InstructionStep[]> = {
  telegram: [
    {
      label: "Download Desktop App",
      description:
        "Download Telegram on your computer from desktop.telegram.org.",
    },
    {
      label: "Log In",
      description: "Open the app on desktop and log in using your phone.",
    },
    {
      label: "Open Chat",
      description:
        "Go to the chat you intend to analyze and tap on the three dots in the top right corner.",
    },
    {
      label: "Export Chat",
      description: "Click on 'Export Chat History'.",
    },
    {
      label: "Select Options",
      description: "Unselect all boxes, media files are not analyzed.",
    },
    {
      label: "Choose Format",
      description: "IMPORTANT: Change the format to 'Machine-Readable JSON'.",
    },
    {
      label: "Export",
      description: "Go ahead and export.",
    },
    {
      label: "Show Data",
      description: "Click 'Show My Data'.",
    },
    {
      label: "Open File",
      description: "Open the file in the folder.",
    },
    {
      label: "Upload File",
      description: "Upload the file using the choose file option below.",
    },
    {
      label: "Get Analysis",
      description: "Get your analysis.",
    },
  ],
  instagram: [
    {
      label: "Open Profile",
      description: "Open your profile on Instagram.",
    },
    {
      label: "Access Menu",
      description: "Tap on the three lines in the top right corner.",
    },
    {
      label: "Your Activity",
      description: "Tap 'Your Activity'.",
    },
    {
      label: "Download Information",
      description: "Tap 'Download Your Information'.",
    },
    {
      label: "Select Download",
      description: "Tap 'Download or transfer information'.",
    },
    {
      label: "Choose Data",
      description: "Tap 'Some of your information'.",
    },
    {
      label: "Select Messages",
      description: "Choose 'messages'.",
    },
    {
      label: "Continue",
      description: "Tap 'next'.",
    },
    {
      label: "Choose Device",
      description: "Tap 'download to device'.",
    },
    {
      label: "Set Date Range",
      description: "Tap 'last year' for date range.",
    },
    {
      label: "Select Format",
      description: "Choose 'JSON' for format.",
    },
    {
      label: "Create Files",
      description: "Tap 'create files'.",
    },
    {
      label: "Wait for Email",
      description:
        "Wait for Instagram to email you the download link (10-30 minutes), then click the link or download the file from the 'Download Your Information' page in the app.",
    },
    {
      label: "Download File",
      description: "Download the file.",
    },
    {
      label: "Upload File",
      description: "Upload the SPECIFIC file by navigating to your_instagram_activity -> messages -> inbox -> [USER_YOU_WANT_TO_ANALYZE] -> message_1.json using the 'Choose File' option above.",
    },
    {
      label: "Get Analysis",
      description: "Get your analysis.",
    },
  ],
  whatsapp: [
    {
      label: "Open Conversation",
      description:
        "Open the conversation on WhatsApp that you want to analyze.",
    },
    {
      label: "Access Menu",
      description: "Tap on the three dots in the top right corner.",
    },
    {
      label: "More Options",
      description: "Tap on 'More'.",
    },
    {
      label: "Export Chat",
      description: "Tap on 'Export chat'.",
    },
    {
      label: "Choose Option",
      description: "Choose 'Without media'.",
    },
    {
      label: "Share",
      description: "Share it to yourself.",
    },
    {
      label: "Download Chat",
      description: "Download the chat.",
    },
    {
      label: "Upload File",
      description: "Upload the file using the choose file option below.",
    },
    {
      label: "Get Analysis",
      description: "Get your analysis.",
    },
  ],
}; 