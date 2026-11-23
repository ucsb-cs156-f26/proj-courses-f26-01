import EnrollmentHistoryPage from "main/pages/EnrollmentHistory/EnrollmentHistoryPage";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "pages/EnrollmentHistory/EnrollmentHistoryPage",
  component: EnrollmentHistoryPage,
};

const Template = () => <EnrollmentHistoryPage />;

export const Default = Template.bind({});

Default.parameters = {
  msw: [
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingBoth, {
        status: 200,
      });
    }),
    http.get("/api/currentUser", () => {
      return HttpResponse.status(403);
    }),
  ],
};
