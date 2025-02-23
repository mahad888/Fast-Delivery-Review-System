import { useEffect, useState, memo } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Select, MenuItem, Typography, Container, CircularProgress, TablePagination,
  Button, Alert, Skeleton, Stack, Chip
} from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 500,
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const HeaderTableCell = styled(StyledTableCell)(({ theme }) => ({
  fontWeight: 600,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
}));

const ModernSelect = styled(Select)(({ theme }) => ({
  borderRadius: '8px',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.divider,
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
}));

const MemoizedSelect = memo(({ value, onChange, options }) => (
  <ModernSelect
    value={value}
    onChange={onChange}
    fullWidth
    variant="outlined"
  >
    {options.map((option) => (
      <MenuItem key={option.value} value={option.value}>
        <Chip 
          label={option.label} 
          size="small" 
          sx={{ 
            borderRadius: '6px',
            backgroundColor: option.value === value ? 'primary.light' : 'transparent',
            color: option.value === value ? 'primary.contrastText' : 'inherit'
          }} 
        />
      </MenuItem>
    ))}
  </ModernSelect>
));

const ReviewTagging = () => {
  // ... keep existing state and logic ...
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Properly initialized
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 10,
    total: 0,
    sortField: 'createdAt',
    sortOrder: 'desc'
  });
  const token = localStorage.getItem("auth");

  useEffect(() => {
    fetchReviews();
  }, [pagination.page, pagination.rowsPerPage, pagination.sortField, pagination.sortOrder]);

  const fetchReviews = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/reviews/data", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: pagination.page + 1,
          limit: pagination.rowsPerPage,
          sort: pagination.sortField,
          order: pagination.sortOrder
        },
        timeout: 15000
      });

      if (response.data?.success) {
        setReviews(response.data.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination?.total || 0
        }));
      }
    } catch (err) {  // Renamed to avoid variable shadowing
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleChangePage = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleChangeRowsPerPage = (event) => {
    setPagination(prev => ({
      ...prev,
      rowsPerPage: parseInt(event.target.value, 10),
      page: 0
    }));
  };

  const updateTag = async (id, field, value) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/reviews/${id}`,
        { [field]: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        setReviews(prev => prev.map(review => 
          review._id === id ? response.data.data : review
        ));
      }
    } catch (err) {  // Renamed to avoid variable shadowing
      console.error("Update error:", err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to update review');
    }
  };


  if (error) return (
    <Container sx={{ textAlign: "center", mt: 4 }}>
      <Alert 
        severity="error" 
        sx={{ 
          mb: 2,
          borderRadius: '12px',
          alignItems: 'center',
          textAlign: 'left'
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <span>⚠️</span>
          <div>
            <Typography variant="subtitle1">{error}</Typography>
            <Button 
              variant="outlined" 
              onClick={fetchReviews}
              sx={{ mt: 1 }}
            >
              Retry Loading
            </Button>
          </div>
        </Stack>
      </Alert>
    </Container>
  );

  if (loading) return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Skeleton variant="rounded" width={200} height={40} sx={{ mb: 3 }} />
      <Skeleton variant="rounded" height={400} />
    </Container>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="700" color="primary.main">
          Review Management
        </Typography>
        <Chip 
          label={`${pagination.total} Total Reviews`} 
          variant="outlined" 
          color="primary"
        />
      </Stack>

      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: '16px',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <TableContainer sx={{ maxHeight: 'calc(100vh - 240px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <HeaderTableCell>Agent</HeaderTableCell>
                <HeaderTableCell>Review</HeaderTableCell>
                <HeaderTableCell>Sentiment</HeaderTableCell>
                <HeaderTableCell>Accuracy</HeaderTableCell>
                <HeaderTableCell>Performance</HeaderTableCell>
                <HeaderTableCell>Feedback</HeaderTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reviews.map((review) => (
                <StyledTableRow key={review._id} hover>
                  <StyledTableCell>
                    <Typography fontWeight="600">{review.agentName}</Typography>
                  </StyledTableCell>
                  <StyledTableCell sx={{ maxWidth: 400 }}>
                    <Typography variant="body2" color="text.secondary">
                      {review.reviewText}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell>
                    <MemoizedSelect
                      value={review.sentiment || ""}
                      onChange={(e) => updateTag(review._id, "sentiment", e.target.value)}
                      options={[
                        { value: "Positive", label: "Positive" },
                        { value: "Neutral", label: "Neutral" },
                        { value: "Negative", label: "Negative" },
                      ]}
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    <MemoizedSelect
                      value={review.accuracy || ""}
                      onChange={(e) => updateTag(review._id, "accuracy", e.target.value)}
                      options={[
                        { value: "Order Accurate", label: "Accurate" },
                        { value: "Incorrect", label: "Incorrect" },
                      ]}
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    <MemoizedSelect
                      value={review.performance || ""}
                      onChange={(e) => updateTag(review._id, "performance", e.target.value)}
                      options={[
                        { value: "Fast", label: "Fast" },
                        { value: "Average", label: "Average" },
                        { value: "Slow", label: "Slow" },
                      ]}
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    <MemoizedSelect
                      value={review.customerFeedbackType || ""}
                      onChange={(e) => updateTag(review._id, "customerFeedbackType", e.target.value)}
                      options={[
                        { value: "Positive", label: "Positive" },
                        { value: "Neutral", label: "Neutral" },
                        { value: "Negative", label: "Negative" },
                      ]}
                    />
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={pagination.total}
          rowsPerPage={pagination.rowsPerPage}
          page={pagination.page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            '& .MuiTablePagination-actions': {
              marginLeft: 2,
              '& button': {
                borderRadius: '8px',
                border: '1px solid',
                borderColor: 'divider'
              }
            }
          }}
        />
      </Paper>
    </Container>
  );
};

export default ReviewTagging;