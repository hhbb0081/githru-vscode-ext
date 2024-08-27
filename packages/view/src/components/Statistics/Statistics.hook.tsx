import { useGlobalData } from "hooks";
import { ClusterNode, CommitNode } from "types";

export const useGetSelectedData = () => {
  const { filteredData, selectedData, selectedCommitId } = useGlobalData();
  return selectedData.length
    ? selectedCommitId
      ? selectedData
          .map((clusterNode) => {
            const filteredCommitNodes = clusterNode.commitNodeList.filter(
              (commitNode) => commitNode.commit.id === selectedCommitId
            );

            return {
              ...clusterNode,
              commitNodeList: filteredCommitNodes,
            };
          })
          .filter((clusterNode) => clusterNode.commitNodeList.length > 0)
      : selectedData
    : filteredData;
};

export const useGetSelectedCommitData = () => {
  const { filteredData, selectedData } = useGlobalData();

  const getSelectedCommitData = (commitId: string) => {
    const filteredCommitdata = selectedData
      .flatMap((clusterNode: ClusterNode) => clusterNode.commitNodeList)
      .filter((commitNode: CommitNode) => commitNode.commit.id === commitId);
    return selectedData.length ? filteredCommitdata : filteredData;
  };
  return { getSelectedCommitData };
};
