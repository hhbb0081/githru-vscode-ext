import { AuthorBarChart } from "./AuthorBarChart";
import { FileIcicleSummary } from "./FileIcicleSummary";
import { InsDelChart } from "./InsDelChart";
import "./Statistics.scss";

const Statistics = () => {
  return (
    <div className="statistics">
      <AuthorBarChart />
      <FileIcicleSummary />
      <InsDelChart />
    </div>
  );
};

export default Statistics;
