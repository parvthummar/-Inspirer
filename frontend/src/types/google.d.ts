/** The parts of Google Identity Services (accounts.google.com/gsi/client) that Architect uses. */

type GoogleCredentialResponse = { credential: string };

type GoogleButtonOptions = {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: number;
};

interface Window {
  google?: {
    accounts: {
      id: {
        initialize(config: {
          client_id: string;
          callback: (response: GoogleCredentialResponse) => void;
          context?: "signin" | "signup" | "use";
          ux_mode?: "popup" | "redirect";
        }): void;
        renderButton(parent: HTMLElement, options: GoogleButtonOptions): void;
        disableAutoSelect(): void;
      };
    };
  };
}
