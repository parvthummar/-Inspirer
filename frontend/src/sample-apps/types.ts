import type { ComponentType } from "react";
import type { TemplateKey } from "./templateKeys";

export type SampleAppProps = {
  /** The project's name, shown as the app's title. */
  appName: string;
  /** Phone-sized preview: navigation moves to the top and layouts stack. */
  compact: boolean;
};

export type SampleApp = {
  key: TemplateKey;
  component: ComponentType<SampleAppProps>;
};
