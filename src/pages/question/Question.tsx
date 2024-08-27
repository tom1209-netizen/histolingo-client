import React, { useEffect, useState } from "react";
import NavTabs from "../../components/reusable/NavTabs";
import { Box } from "@mui/material";
import SearchField from "../../components/reusable/SearchField";
import CreateImportButtonGroup from "../../components/reusable/CreateImportButtonGroup";
import { useSearchParams } from "react-router-dom";
import { convertSearchParamsToObj } from "../../utils/common";
import { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { Switch } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { EditOutlined } from "@mui/icons-material";
import DataTable from "../../components/reusable/Table";
import { useRowActions } from "../../hooks/useRowActions";
import { formatTimestamp } from "../../utils/formatTime";
import { getQuestions, switchQuestionStatus } from "../../api/question";
import { LoadingTable } from "../../components/reusable/Loading";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const Question = () => {
  const { t } = useTranslation();
  const { handleEditRow } = useRowActions();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuestionQuery: any = convertSearchParamsToObj(searchParams);
  const [loading, setLoading] = useState<boolean>(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [rowCount, setRowCount] = useState<number>(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [isTableLoading, setIsTableLoading] = useState<boolean>(false);

  const handleStatusChange = async (id: any, status: any) => {
    const response = await switchQuestionStatus(id, status);
    console.log(response);
    if (response.status === 200) {
      console.log("hello?");
      toast.success(t("toast.switchStatusSuccess"));
    } else {
      toast.error(t("toast.switchStatusFail"));
    }
  };

  const columns: GridColDef[] = [
    { field: "ask", headerName: "Question", width: 250 },
    {
      field: "topic",
      headerName: "Topic",
      width: 180,
      valueGetter: (value, row) => (row.topic ? row.topic.name : "N/A"),
    },
    {
      field: "country",
      headerName: "Country",
      width: 130,
      valueGetter: (value, row) => (row.country ? row.country.name : "N/A"),
    },
    {
      field: "questionType",
      headerName: "Question Type",
      width: 130,
      valueGetter: (value, row) => {
        switch (row.questionType) {
          case 0:
            return "Multiple Choice";
          case 1:
            return "True/False";
          case 2:
            return "Matching";
          case 3:
            return "Fill in the blank";
          default:
            return "No question type";
        }
      },
    },
    { field: "createdAt", headerName: "Created At", width: 130 },
    { field: "updatedAt", headerName: "Updated At", width: 130 },
    {
      field: "status",
      headerName: "Status",
      description:
        "This column allows users to switch the status of the data (aka soft delete).",
      width: 90,
      renderCell: (params) => (
        <Switch
          defaultChecked={params.row.status == 1}
          onChange={() =>
            handleStatusChange(params.row._id, params.row.status == 1 ? 0 : 1)
          }
        />
      ),
    },
    {
      field: "edit",
      headerName: "Edit",
      width: 50,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          onClick={() => handleEditRow(params.id.toString(), "question")}
          color="primary"
          aria-label="delete"
        >
          <EditOutlined />
        </IconButton>
      ),
    },
  ];

  const fetchQuestions = async (page: number, pageSize: number) => {
    setIsTableLoading(true);
    try {
      const response = await getQuestions({
        ...searchQuestionQuery,
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
      });
      const questionsData = response.data.data.questions;
      const formattedQuestions = questionsData.map((question: any) => ({
        ...question,
        createdAt: formatTimestamp(question.createdAt),
        updatedAt: formatTimestamp(question.updatedAt),
      }));
      const totalRows = response.data.data.totalQuestions;
      console.log(questionsData);
      setQuestions(formattedQuestions);
      setRowCount(totalRows);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setIsTableLoading(false);
    }
  };
  useEffect(() => {
    fetchQuestions(paginationModel.page, paginationModel.pageSize);
  }, [paginationModel, searchParams]);

  const handlePageChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
    fetchQuestions(model.page, model.pageSize);
  };

  if (loading) {
    return <LoadingTable />;
  }
  return (
    <>
      <h1>Question Dashboard</h1>
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
              setSearchParams({ ...searchQuestionQuery, status: value })
            }
            value={searchQuestionQuery.status || ""}
          />
          <SearchField
            label="Search question"
            delay={1500}
            onChange={(value: any) =>
              setSearchParams({ ...searchQuestionQuery, search: value.trim() })
            }
          />
        </Box>
        <CreateImportButtonGroup createPath="/createquestion" importPath="/" />
      </Box>
      <DataTable
        isLoading={isTableLoading}
        columns={columns}
        rows={questions}
        getRowId={(row) => row._id}
        rowCount={rowCount}
        paginationModel={paginationModel}
        onPageChange={handlePageChange}
      />
    </>
  );
};

export default Question;
