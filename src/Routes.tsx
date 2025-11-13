import {observer} from "mobx-react-lite";
import {Navigate, Route, Routes} from "react-router";
import Jobs from "@/pages/jobs/Jobs";
import JobDetails from "@/pages/job-details/JobDetails";
import Create from "@/pages/create/Create";

const AppRoutes = observer(() => {
  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="/new" />} />
      <Route path="/new" element={<Create />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/jobs/:id" element={<JobDetails />} />
    </Routes>
  );
});

export default AppRoutes;
