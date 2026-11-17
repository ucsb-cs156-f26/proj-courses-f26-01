
import React from "react";

import CSVDownloadsPage from "main/pages/CSV/CSVDownloadsPage";

import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { allTheSubjects } from "fixtures/subjectFixtures";

import { http, HttpResponse } from "msw";

export default {
  title: "pages/CSV/CSVDownloadsPage",
  component: CSVDownloadsPage,
};

const Template = () => <CSVDownloadsPage />;

export const Default = Template.bind({});
Default.parameters = {
  msw: [
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingBoth, {
        status: 200,
      });
    }),
    http.get("/api/currentUser", () => {
      return HttpResponse.status(403); // returns 403 when not logged in
    }),
    http.get("/api/UCSBSubjects/all", () => {
      return HttpResponse.json(allTheSubjects);
    }),
  ],
};

export const EnrollmentDownloads = Template.bind({});

EnrollmentDownloads.parameters = {
  ...Default.parameters,
  msw: [
    ...Default.parameters.msw,
    http.get("/api/enrollment/csv/quarter", () => {
      return new HttpResponse("course,enrollment\nCMPSC 8,100\n", {
        status: 200,
        headers: { "Content-Type": "text/csv" },
      });
    }),
  ],
};

EnrollmentDownloads.play = async ({ canvasElement }) => {
  const button = Array.from(
    canvasElement.querySelectorAll("button"),
  ).find((button) =>
    button.textContent.includes("Enrollment Downloads"),
  );

  button?.click();
};
