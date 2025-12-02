import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
  IconButton,
} from '@mui/material';
import { Check, Close, Done } from '@mui/icons-material';
import { useAuth } from '../../../hooks/useAuth';
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import Label from '../../../components/label';
import { fetchReceivedOrders, acceptOrder, rejectOrder, completeOrder } from '../../../store/slices/action';
import { applySortFilter, getComparator } from '../../../utils/tableOperations';

const TABLE_HEAD = [
  { id: 'customer', label: 'Customer', alignRight: false },
  { id: 'item', label: 'Item', alignRight: false },
  { id: 'quantity', label: 'Quantity', alignRight: false },
  { id: 'type', label: 'Type', alignRight: false },
  { id: 'senderProvince', label: 'Sender Province', alignRight: false },
  { id: 'price', label: 'Price', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: 'date', label: 'Date', alignRight: false },
  { id: 'actions', label: 'Actions', alignRight: true },
];

const ReceiveOrdersPage = () => {
  const { tokens } = useAuth();
  const dispatch = useDispatch();
  const { receivedOrders, loading } = useSelector((state) => state.orders);

  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('date');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionType, setActionType] = useState(''); // 'accept', 'reject', or 'complete'
  const [statusFilter, setStatusFilter] = useState('pending');
  const [orderTypeFilter, setOrderTypeFilter] = useState('all');

  useEffect(() => {
    if (tokens && tokens.access && tokens.access.token) {
      loadData();
    }
  }, [tokens, dispatch, statusFilter]);

  const loadData = () => {
    if (tokens && tokens.access && tokens.access.token) {
      dispatch(fetchReceivedOrders(tokens.access.token))
        .then(() => setIsTableLoading(false))
        .catch(() => setIsTableLoading(false));
    }
  };

  const handleOpenConfirmDialog = (orderItem, action) => {
    setSelectedOrder(orderItem);
    setActionType(action);
    setIsConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setIsConfirmDialogOpen(false);
    setSelectedOrder(null);
    setActionType('');
  };

  const handleConfirmAction = async () => {
    if (!tokens || !tokens.access || !tokens.access.token) {
      toast.error('Authentication required');
      return;
    }

    try {
      if (actionType === 'accept') {
        await dispatch(acceptOrder(selectedOrder.id || selectedOrder._id, tokens.access.token));
        toast.success('Order accepted successfully');
      } else if (actionType === 'reject') {
        await dispatch(rejectOrder(selectedOrder.id || selectedOrder._id, tokens.access.token));
        toast.success('Order rejected');
      } else if (actionType === 'complete') {
        await dispatch(completeOrder(selectedOrder.id || selectedOrder._id, tokens.access.token));
        toast.success('Order completed successfully. Stock updated.');
      }
      handleCloseConfirmDialog();
      loadData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || `Failed to ${actionType} order`;
      console.error(`Order ${actionType} error:`, error);
      toast.error(errorMessage);
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
      default:
        return 'default';
    }
  };

  let filteredOrders = receivedOrders;
  
  // Filter by status
  if (statusFilter !== 'all') {
    filteredOrders = filteredOrders.filter((o) => o.status === statusFilter);
  }
  
  // Filter by order type
  if (orderTypeFilter !== 'all') {
    filteredOrders = filteredOrders.filter((o) => o.order_type === orderTypeFilter);
  }
  
  filteredOrders = applySortFilter(filteredOrders, getComparator(order, orderBy), '');

  return (
    <>
      <Helmet>
        <title>Receive Orders</title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h3" gutterBottom>
            Receive Orders
          </Typography>
        </Stack>

        <Card sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} sx={{ p: 3 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="accepted">Accepted</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Order Type</InputLabel>
              <Select value={orderTypeFilter} label="Order Type" onChange={(e) => setOrderTypeFilter(e.target.value)}>
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
                            <TableCell align="left">
                              {orderItem.customer?.name || 'N/A'}
                            </TableCell>
                            <TableCell align="left">{orderItem.item}</TableCell>
                            <TableCell align="left">
                              <Chip label={orderItem.quantity} color="primary" variant="outlined" />
                            </TableCell>
                            <TableCell align="left">
                              <Label color={orderItem.order_type === 'transfer' ? 'primary' : 'success'}>
                                {orderItem.order_type?.toUpperCase()}
                              </Label>
                            </TableCell>
                            <TableCell align="left">
                              {orderItem.senderProvince?.name || 'N/A'}
                            </TableCell>
                            <TableCell align="left">
                              {orderItem.order_type === 'sale' && orderItem.price ? (
                                <Chip label={`$${parseFloat(orderItem.price).toFixed(2)}`} color="success" size="small" />
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell align="left">
                              <Label color={getStatusColor(orderItem.status)}>
                                {orderItem.status?.toUpperCase()}
                              </Label>
                            </TableCell>
                            <TableCell align="left">
                              {new Date(orderItem.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell align="right">
                              {orderItem.status === 'pending' && (
                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                  <IconButton
                                    color="success"
                                    onClick={() => handleOpenConfirmDialog(orderItem, 'accept')}
                                    title="Accept Order"
                                  >
                                    <Check />
                                  </IconButton>
                                  <IconButton
                                    color="error"
                                    onClick={() => handleOpenConfirmDialog(orderItem, 'reject')}
                                    title="Reject Order"
                                  >
                                    <Close />
                                  </IconButton>
                                </Stack>
                              )}
                              {orderItem.status === 'accepted' && orderItem.order_type === 'sale' && (
                                <IconButton
                                  color="primary"
                                  onClick={() => handleOpenConfirmDialog(orderItem, 'complete')}
                                  title="Complete Sale Order"
                                >
                                  <Done />
                                </IconButton>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info" sx={{ m: 2 }}>
                  No pending orders to receive.
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

      {/* Confirm Action Dialog */}
      <Dialog open={isConfirmDialogOpen} onClose={handleCloseConfirmDialog}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {actionType} this order?
            {selectedOrder && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Customer:</strong> {selectedOrder.customer?.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Item:</strong> {selectedOrder.item}
                </Typography>
                <Typography variant="body2">
                  <strong>Quantity:</strong> {selectedOrder.quantity}
                </Typography>
                {selectedOrder.order_type === 'sale' && selectedOrder.price && (
                  <Typography variant="body2">
                    <strong>Price:</strong> ${parseFloat(selectedOrder.price).toFixed(2)}
                  </Typography>
                )}
                {actionType === 'complete' && selectedOrder.order_type === 'sale' && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Completing this sale will reduce customer stock quantity by {selectedOrder.quantity}.
                  </Alert>
                )}
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Cancel</Button>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            color={
              actionType === 'accept'
                ? 'success'
                : actionType === 'complete'
                ? 'primary'
                : 'error'
            }
          >
            {actionType === 'accept'
              ? 'Accept'
              : actionType === 'complete'
              ? 'Complete'
              : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReceiveOrdersPage;

