import "@servicenow/sdk/global";
import { UiPage } from "@servicenow/sdk/core";
import page from "../../client/index.html";

export const properties_viewer_page = UiPage({
  $id: Now.ID["properties-viewer-page"],
  endpoint: "x_589236_prprts_properties_viewer.do",
  html: page,
  direct: true
});
