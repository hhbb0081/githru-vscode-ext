import { FileChangesMap } from "../FileIcicleSummary/FileIcicleSummary.type";
import { DataType } from "./InsDelChart.type";

// export const convertToDataType = (startNode: FileChangesNode): DataType => {
//   const listData: ListDataType[] = [];
//   const positives: string[] = [];
//   const negatives: string[] = [];

//   function traverse(node: FileChangesNode, category: string): void {
//     const currentCategory = category ? `${category}/${node.name}` : node.name;

//     if (node.value !== undefined) {
//       const { value } = node;
//       listData.push({
//         name: node.name,
//         category: currentCategory,
//         value: value,
//       });

//       if (value >= 0) {
//         positives.push(node.name);
//       } else {
//         negatives.push(node.name);
//       }
//     }

//     node.children.forEach((child) => {
//       traverse(child, currentCategory);
//     });
//   }

//   traverse(startNode, "");

//   const columns = ["name", "category", "value"];
//   const positive = "positives";
//   const negative = "negatives";

//   const data = {
//     listData,
//     columns,
//     positive,
//     negative,
//     negatives,
//     positives,
//   };

//   return data;
// };

// export const convertToDataType = (fileChangesNode: FileChangesNode): DataType => {
//   const listData: { name: string; category: string; value: number }[] = [];

//   const traverseNode = (node: FileChangesNode, path: string): void => {
//     const currentPath = path ? `${path}/${node.name}` : node.name;

//     if (node.children && node.children.length > 0) {
//       node.children.forEach((child) => traverseNode(child, currentPath));
//     }

//     if (node.insertions !== undefined) {
//       listData.push({
//         name: currentPath,
//         category: "True",
//         value: node.insertions,
//       });
//     }

//     if (node.deletions !== undefined) {
//       listData.push({
//         name: currentPath,
//         category: "False",
//         value: node.deletions,
//       });
//     }
//   };

//   traverseNode(fileChangesNode, "");

//   return {
//     listData,
//     columns: ["speaker", "ruling", "count"],
//     negative: "← Deletions",
//     positive: "Insertions →",
//     negatives: ["False"],
//     positives: ["True"],
//   };
// };

// export const convertToDataType = (fileChangesNode: FileChangesNode): DataType => {
//   const listData: { name: string; category: string; value: number }[] = [];

//   const accumulateChanges = (node: FileChangesNode): { insertions: number; deletions: number } => {
//     // 누적할 insertions와 deletions 값
//     const totalInsertions = (node.children || []).reduce((sum, child) => {
//       const childAcc = accumulateChanges(child);
//       return sum + childAcc.insertions;
//     }, node.insertions ?? 0);

//     const totalDeletions = (node.children || []).reduce((sum, child) => {
//       const childAcc = accumulateChanges(child);
//       return sum + childAcc.deletions;
//     }, node.deletions ?? 0);

//     // 누적된 결과를 DataType 형식의 listData에 추가
//     if (totalInsertions > 0) {
//       listData.push({
//         name: node.name,
//         category: "True", // 삽입이므로 "True"
//         value: totalInsertions,
//       });
//     }

//     if (totalDeletions > 0) {
//       listData.push({
//         name: node.name,
//         category: "False", // 삭제이므로 "False"
//         value: totalDeletions,
//       });
//     }

//     return { insertions: totalInsertions, deletions: totalDeletions };
//   };

//   accumulateChanges(fileChangesNode);

//   const data = {
//     listData: listData,
//     columns: ["speaker", "ruling", "count"],
//     negative: "← Deletions",
//     positive: "Insertions →",
//     negatives: ["False"],
//     positives: ["True"],
//   };
//   return data;
// };

export const convertFileChangesMapToDataType = (fileChangesMap: FileChangesMap, currentPath: string): DataType => {
  const listData: { name: string; category: string; value: number }[] = [];

  Object.entries(fileChangesMap).forEach(([path, { insertions, deletions }]) => {
    const pathParts = path.split("/"); // 현재 경로 split

    const isWithinCurrentPath =
      pathParts.some((p) => p === currentPath) && pathParts.indexOf(currentPath) + 3 <= pathParts.length;

    if (isWithinCurrentPath) {
      if (insertions > 0) {
        listData.push({
          name: path,
          category: "True",
          value: insertions,
        });
      }
      if (deletions > 0) {
        listData.push({
          name: path,
          category: "False",
          value: deletions,
        });
      }
    }
  });

  const data = {
    listData: listData,
    columns: ["speaker", "ruling", "count"],
    negative: "← Deletions",
    positive: "Insertions →",
    negatives: ["Mostly false", "False"],
    positives: ["Mostly true", "True"],
  };
  return data;
};
