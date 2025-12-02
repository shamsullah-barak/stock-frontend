import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  Card,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Alert,
  Chip,
  Tabs,
  Tab,
  Box,
} from '@mui/material';
import { useAuth } from '../../../hooks/useAuth';
import Scrollbar from '../../../components/scrollbar';
import Label from '../../../components/label';
import { fetchOrders } from '../../../store/slices/action';
import { applySortFilter, getComparator } from '../../../utils/tableOperations';

const TABLE_HEAD = [
  { id: 'item', label: 'Item', alignRight: false },
  { id: 'quantity', label: 'Quantity', alignRight: false },
  { id: 'type', label: 'Type', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: 'location', label: 'Location', alignRight: false },
  { id: 'date', label: 'Date', alignRight: false },
];

const MyOrdersPage = () => {
  const { tokens } = useAuth();
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);

  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('date');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    if (tokens && tokens.access && tokens.access.token) {
      loadData();
    }
  }, [tokens, dispatch, statusFilter, typeFilter]);

  const loadData = () => {
    if (tokens && tokens.access && tokens.access.token) {
      const filters = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (typeFilter !== 'all') filters.order_type = typeFilter;

      dispatch(fetchOrders(tokens.access.token, filters))
        .then(() => setIsTableLoading(false))
        .catch(() => setIsTableLoading(false));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'completed':
        return 'info';
      case 'rejected':
        return 'error';
      case 'in_transit':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type) => {
    return type === 'transfer' ? 'primary' : 'success';
  };

  let filteredOrders = orders;
  if (statusFilter !== 'all') {
    filteredOrders = filteredOrders.filter((o) => o.status === statusFilter);
  }
  if (typeFilter !== 'all') {
    filteredOrders = filteredOrders.filter((o) => o.order_type === typeFilter);
  }

  filteredOrders = applySortFilter(filteredOrders, getComparator(order, orderBy), '');

  return (
    <>
      <Helmet>
        <title>My Orders</title>
      </Helmet>

      <Container>
        <Typography variant="h3" gutterBottom sx={{ mb: 5 }}>
          My Orders
        </Typography>

        <Card sx={{ mb: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
            <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
              <Tab label="All Orders" />
              <Tab label="Transfer Orders" />
              <Tab label="Sale Orders" />
            </Tabs>
          </Box>
          <Stack direction="row" spacing={2} sx={{ p: 3 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="accepted">Accepted</MenuItem>
                <MenuItem value="in_transit">In Transit</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Type</InputLabel>
              <Select value={typeFilter} label="Type" onChange={(e) => setTypeFilter(e.target.value)}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="transfer">Transfer</MenuItem>
                <MenuItem value="sale">Sale</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Card>

        {isTableLoading || loading ? (
          <Grid style={{ textAlign: 'center', padding: '40px' }}>
            <CircularProgress />
          </Grid>
        ) : (
          <Card>
            <Scrollbar>
              {filteredOrders && filteredOrders.length > 0 ? (
                <TableContainer sx={{ minWidth: 800 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        {TABLE_HEAD.map((headCell) => (
                          <TableCell key={headCell.id} align={headCell.alignRight ? 'right' : 'left'}>
                            {headCell.label}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredOrders
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((orderItem) => (
                          <TableRow hover key={orderItem.id || orderItem._id}>
                            <TableCell align="left">{orderItem.item}</TableCell>
                            <TableCell align="left">
                              <Chip label={orderItem.quantity} color="primary" variant="outlined" />
                            </TableCell>
                            <TableCell align="left">
                              <Label color={getTypeColor(orderItem.order_type)}>
                                {orderItem.order_type?.toUpperCase()}
                              </Label>
                            </TableCell>
                            <TableCell align="left">
                              <Label color={getStatusColor(orderItem.status)}>
                                {orderItem.status?.toUpperCase()}
                              </Label>
                            </TableCell>
                            <TableCell align="left">
                              {orderItem.order_type === 'transfer' ? (
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Chip
                                    label={orderItem.senderProvince?.name || 'N/A'}
                                    size="small"
                                    color="default"
                                  />
                                  <Typography variant="body2">→</Typography>
                                  <Chip
                                    label={orderItem.receiverProvince?.name || 'N/A'}
                                    size="small"
                                    color="info"
                                  />
                                </Stack>
                              ) : (
                                <Chip
                                  label={orderItem.receiverProvince?.name || 'N/A'}
                                  color="info"
                                  size="small"
                                />
                              )}
                            </TableCell>
                            <TableCell align="left">
                              {new Date(orderItem.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info" sx={{ m: 2 }}>
                  No orders found.
                </Alert>
              )}
            </Scrollbar>
            {filteredOrders && filteredOrders.length > 0 && (
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredOrders.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
              />
            )}
          </Card>
        )}
      </Container>
    </>
  );
};

export default MyOrdersPage;

