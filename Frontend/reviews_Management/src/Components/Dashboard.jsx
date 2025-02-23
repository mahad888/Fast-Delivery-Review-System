import { useEffect, useState } from "react";
import axios from "axios";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, 
  ResponsiveContainer, LabelList, LineChart, Line 
} from "recharts";
import { 
  Container, Typography, Select, MenuItem, Grid, Box, Button,
  CircularProgress, Paper, Skeleton, Alert, Chip, Stack
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import { useSelector } from "react-redux";

const ChartContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '16px',
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)'
  }
}));

const MetricCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  borderRadius: '16px',
  background: theme.palette.primary.main,
  color: theme.palette.common.white,
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)'
}));

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({
    location: "",
    orderType: "",
    serviceRating: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("auth");
  const navigate = useNavigate();
  const {role} = useSelector((state)=>state.auth)
  console.log(role)

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/reviews/dashboard/metrics", {
        params: filters,
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.data.success) throw new Error(response.data.error);
      
      setData({
        ...response.data.data,
        
        priceRangeData: Object.entries(response.data.data.priceRangeOrders)
          .map(([range, count]) => ({ range, count })),
        discountData: Object.entries(response.data.data.discountDistribution)
          .map(([range, count]) => ({ range, count }))
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  // ... existing state and other declarations ...

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('auth');
    // Dispatch logout action
    // Redirect to login page
    navigate('/');
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const COLORS = ["#6366f1", "#3b82f6", "#10b981", "#f59e0b"];

  if (error) return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      <Button variant="contained" onClick={fetchData}>Retry</Button>
    </Container>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="700" color="primary.main">
          Performance Analytics
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button 
            variant="contained" 
            color="secondary"
            disabled={role === "user"} 
            onClick={() => navigate("/review-tagging")}
            sx={{ borderRadius: '12px', px: 4 }}
          >
            Manage Reviews
          </Button>
          <Button 
            variant="outlined" 
            color="error"
            onClick={handleLogout}
            sx={{ borderRadius: '12px', px: 4 }}
          >
            Logout
          </Button>
        </Stack>

      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: '12px' }}>
        <Grid container spacing={2}>
          {['location', 'orderType', 'serviceRating'].map((filter) => (
            <Grid item xs={12} md={4} key={filter}>
              <Select
                fullWidth
                value={filters[filter]}
                onChange={(e) => handleFilterChange(filter, e.target.value)}
                displayEmpty
                variant="outlined"
                sx={{ borderRadius: '8px' }}
              >
                <MenuItem value="">All {filter.replace(/([A-Z])/g, ' $1').trim()}</MenuItem>
                {filter === 'location' && ['Ahmedabad', 'Delhi', 'Mumbai'].map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
                {filter === 'orderType' && ['Food', 'Grocery', 'Pharmacy'].map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
                {filter === 'serviceRating' && [5, 4, 3].map(option => (
                  <MenuItem key={option} value={option}>{option} Stars</MenuItem>
                ))}
              </Select>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Metrics Grid */}
      {loading ? (
        <Grid container spacing={3}>
          {[1,2,3,4].map((_, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: '16px' }} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard>
              <Typography variant="h6">Total Orders</Typography>
              <Typography variant="h3" fontWeight="700">{data?.totalOrders}</Typography>
            </MetricCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard sx={{ background: '#3b82f6' }}>
              <Typography variant="h6">Avg. Rating</Typography>
              <Typography variant="h3" fontWeight="700">{data?.averageRating?.toFixed(1)}</Typography>
            </MetricCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard sx={{ background: '#10b981' }}>
              <Typography variant="h6">Active Agents</Typography>
              <Typography variant="h3" fontWeight="700">{data?.activeAgents}</Typography>
            </MetricCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard sx={{ background: '#f59e0b' }}>
              <Typography variant="h6">Complaints</Typography>
              <Typography variant="h3" fontWeight="700">{data?.complaints}</Typography>
            </MetricCard>
          </Grid>
        </Grid>
      )}

      {/* Charts Section */}
      <Grid container spacing={3} mt={2}>
        {/* Average Ratings Chart */}
        <Grid item xs={12} md={6}>
          <ChartContainer>
            <Typography variant="h6" mb={2}>Average Ratings by Location</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.avgRatingsPerLocation}>
                <XAxis dataKey="location" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="avgRating" fill="#6366f1" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="avgRating" position="top" formatter={(v) => v.toFixed(1)} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Grid>

        {/* Price Range Distribution */}
        <Grid item xs={12} md={6}>
          <ChartContainer>
            <Typography variant="h6" mb={2}>Order Price Distribution</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data?.priceRangeData}
                  dataKey="count"
                  nameKey="range"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {data?.priceRangeData?.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(value) => `${value} orders`} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Grid>

        {/* Discount Distribution */}
        <Grid item xs={12} md={6}>
          <ChartContainer>
            <Typography variant="h6" mb={2}>Discount Utilization</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data?.discountData}>
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Grid>

        {/* Performance Comparison */}
        <Grid item xs={12} md={6}>
          <ChartContainer>
            <Typography variant="h6" mb={2}>Top & Bottom Performers</Typography>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, background: '#f0fdf4' }}>
                  <Typography variant="subtitle1" color="success.main" mb={1}>
                    🏆 Top Performers
                  </Typography>
                  <Stack spacing={1}>
                    {data?.topAgents?.map((agent, i) => (
                      <Box key={agent.agentName} display="flex" justifyContent="space-between">
                        <Typography>{i+1}. {agent?.agentName}</Typography>
                        <Chip label={`${agent?.rating}⭐`} color="success" size="small" />
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, background: '#fef2f2' }}>
                  <Typography variant="subtitle1" color="error.main" mb={1}>
                    ⚠️ Needs Improvement
                  </Typography>
                  <Stack spacing={1}>
                    {data?.bottomAgents?.map((agent, i) => (
                      <Box key={agent.agentName} display="flex" justifyContent="space-between">
                        <Typography>{i+1}. {agent.agentName}</Typography>
                        <Chip label={`${agent.rating}⭐`} color="error" size="small" />
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </ChartContainer>
        </Grid>
      </Grid>

      {/* Complaint Analysis */}
      <ChartContainer sx={{ mt: 3 }}>
        <Typography variant="h6" mb={2}>Common Complaint Types</Typography>
        <Grid container spacing={2}>
          {data?.commonComplaints?.map((complaint, i) => (
            <Grid item xs={12} sm={6} md={4} key={complaint.type}>
              <Paper sx={{ p: 2, borderLeft: `4px solid ${COLORS[i % COLORS.length]}` }}>
                <Box display="flex" justifyContent="space-between">
                  <Typography fontWeight="500">{complaint.type}</Typography>
                  <Chip label={complaint.count} color="primary" />
                </Box>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  {complaint.example}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </ChartContainer>
    </Container>
  );
};

export default Dashboard;