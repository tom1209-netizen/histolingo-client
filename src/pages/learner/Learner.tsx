import { PreviewOutlined } from "@mui/icons-material";
import { Box, Switch } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getLearners, switchLearnerStatus } from "../../api/learners";
import { LoadingTable } from "../../components/reusable/Loading";
import NavTabs from "../../components/reusable/NavTabs";
import SearchField from "../../components/reusable/SearchField";
import DataTable from "../../components/reusable/Table";
import { convertSearchParamsToObj } from "../../utils/common";

const Learner = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchLearnerQuery: any = convertSearchParamsToObj(searchParams);
  const [loading, setLoading] = useState<boolean>(true);
  const [learners, setLearners] = useState<any[]>([]);
  const [rowCount, setRowCount] = useState<number>(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [isTableLoading, setIsTableLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleStatusChange = async (id: any, status: any) => {
    const response = await switchLearnerStatus(id, status);
    if (response.status === 200) {
      toast.success("Status changed successfully");
    } else {
      toast.error("Failed to change status. Please try again.");
    }
  };

  const handleViewDetail = (id: string) => {
    navigate(`/learnerdetail/${id}`);
  };

  const columns: GridColDef[] = [
    { field: "userName", headerName: "Username", flex: 1, sortable: false },
    { field: "rank", headerName: "Ranking", flex: 1, sortable: false },
    {
      field: "email",
      headerName: "Email",
      flex: 2,
      sortable: false,
    },
    {
      field: "registrationDate",
      headerName: "Registration Date",
      flex: 1,
      sortable: false,
    },
    {
      field: "totalScore",
      headerName: "Total Score",
      flex: 1,
      sortable: false,
    },
    {
      field: "totalTime",
      headerName: "Total time",
      flex: 1,
      sortable: false,
    },
    {
      field: "status",
      flex: 0,
      headerName: "Status",
      description:
        "This column allows users to switch the status of the data (aka soft delete).",
      width: 90,
      renderCell: (params) => {
        return (
          <Switch
            defaultChecked={params.row.status == 1}
            onChange={() =>
              handleStatusChange(params.row._id, params.row.status == 1 ? 0 : 1)
            }
          />
        );
      },
    },
    {
      field: "edit",
      headerName: "See detail",
      width: 100,
      flex: 0,
      align: "center",
      sortable: false,
      renderCell: (params) => (
        <IconButton
          onClick={() => handleViewDetail(params.row._id)}
          color="primary"
          aria-label="delete"
        >
          <PreviewOutlined />
        </IconButton>
      ),
    },
  ];

  const fetchLearners = async (page: number, pageSize: number) => {
    setIsTableLoading(true);
    try {
      const response = await getLearners({
        ...searchLearnerQuery,
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
      });
      const learnersData = response.data.data.players;
      console.log(learnersData);
      const totalRows = response.data.data.totalCount;
      console.log(learnersData);
      setLearners(learnersData);
      setRowCount(totalRows);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setIsTableLoading(false);
    }
  };
  useEffect(() => {
    fetchLearners(paginationModel.page, paginationModel.pageSize);
  }, [paginationModel, searchParams]);

  const handlePageChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
  };

  if (loading) {
    return <LoadingTable />;
  }
  return (
    <>
      <h1>Learner Dashboard</h1>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <NavTabs
            onChange={(value: any) =>
              setSearchParams({ ...searchLearnerQuery, status: value })
            }
            value={searchLearnerQuery.status || ""} 
          />
          <SearchField
            label="Search learner"
            delay={1500}
            onChange={(value: any) =>
              setSearchParams({ ...searchLearnerQuery, search: value })
            }
          />
        </Box>
      </Box>
      <DataTable
        isLoading={isTableLoading}
        columns={columns}
        rows={learners}
        getRowId={(row) => row._id}
        rowCount={rowCount}
        paginationModel={paginationModel}
        onPageChange={handlePageChange}
      />
    </>
  );
};

export default Learner;
