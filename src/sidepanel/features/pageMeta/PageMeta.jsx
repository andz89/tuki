import { AlertBoxElement } from "../../components/UI/Notification.jsx";
import PageMetaTemplate from "../../components/templates/PageMeta_template.jsx";
import usePageDetails from "./usePageMeta.js";

export default function PageMeta() {
  const { pageInfo, error } = usePageDetails();

  return (
    <div>
      {error ? (
        <AlertBoxElement message={error} type="error" />
      ) : (
        <PageMetaTemplate data={pageInfo} />
      )}
    </div>
  );
}
