import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  Button,
  Card,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
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
  TextField,
  Typography,
  Alert,
  Chip,
  Box,
} from '@mui/material';
import { useAuth } from '../../../hooks/useAuth';
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import Label from '../../../components/label';
import { fetchSentOrders, createOrder, fetchCustomers, fetchProvinces, fetchUsers } from '../../../store/slices/action';
import { applySortFilter, getComparator } from '../../../utils/tableOperations';

const TABLE_HEAD = [
  { id: 'customer', label: 'Customer', alignRight: false },
  { id: 'item', label: 'Item', alignRight: false },
  { id: 'quantity', label: 'Quantity', alignRight: false },
  { id: 'receiverProvince', label: 'Receiver Province', alignRight: false },
  { id: 'receiverUser', label: 'Receiver User', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: 'date', label: 'Date', alignRight: false },
];

const SendOrdersPage = () => {
  const { tokens, user } = useAuth();
  const dispatch = useDispatch();
  const { sentOrders, loading } = useSelector((state) => state.orders);
  const { customers } = useSelector((state) => state.customers);
  const { provinces } = useSelector((state) => state.provinces);
  const { users } = useSelector((state) => state.users);

  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('date');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(true);

  const [orderData, setOrderData] = useState({
    customer_id: '',
    receiver_province_id: '',
    receiver_user_id: '',
    item: '',
    quantity: '',
  });

  useEffect(() => {
    if (tokens && tokens.access && tokens.access.token) {
      loadData();
    }
  }, [tokens, dispatch]);

  const loadData = () => {
    if (tokens && tokens.access && tokens.access.token) {
      dispatch(fetchSentOrders(tokens.access.token))
        .then(() => setIsTableLoading(false))
        .catch(() => setIsTableLoading(false));
      dispatch(fetchCustomers(tokens.access.token));
      dispatch(fetchProvinces(tokens.access.token));
      dispatch(fetchUsers(tokens.access.token)); // Fetch province users
    }
  };

  const handleOpenModal = () => {
    setOrderData({
      customer_id: '',
      receiver_province_id: '',
      receiver_user_id: '',
      item: '',
      quantity: '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setOrderData({
      customer_id: '',
      receiver_province_id: '',
      receiver_user_id: '',
      item: '',
      quantity: '',
    });
  };

  // Get province users filtered by selected province
  const getProvinceUsers = () => {
    if (!orderData.receiver_province_id) return [];
    const provinceId = parseInt(orderData.receiver_province_id, 10);
    return users.filter((u) => u.role === 'user' && u.province_id === provinceId);
  };

  const handleCreateOrder = async () => {
    if (!tokens || !tokens.access || !tokens.access.token) {
      toast.error('Authentication required');
      return;
    }

    if (!orderData.customer_id || !orderData.receiver_province_id || !orderData.receiver_user_id || !orderData.item || !orderData.quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate receiver_user_id is a valid number
    const receiverUserId = parseInt(orderData.receiver_user_id, 10);
    if (Number.isNaN(receiverUserId) || receiverUserId <= 0) {
      toast.error('Please select a valid receiver user');
      return;
    }

    try {
      const orderPayload = {
        ...orderData,
        receiver_province_id: parseInt(orderData.receiver_province_id, 10),
        receiver_user_id: receiverUserId,
        quantity: parseInt(orderData.quantity, 10),
        order_type: 'transfer',
      };

      await dispatch(createOrder(orderPayload, tokens.access.token));
      toast.success('Transfer order created successfully');
      handleCloseModal();
      // Reload sent orders to show the new order
      if (tokens && tokens.access && tokens.access.token) {
        dispatch(fetchSentOrders(tokens.access.token));
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create order';
      console.error('Order creation error:', error);
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

  const filteredOrders = applySortFilter(sentOrders, getComparator(order, orderBy), '');

  return (
    <>
      <Helmet>
        <title>Send Orders</title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h3" gutterBottom>
            Send Orders
          </Typography>
          <Button variant="contained" onClick={handleOpenModal} startIcon={<Iconify icon="eva:plus-fill" />}>
            Create Transfer Order
          </Button>
        </Stack>

        {isTableLoading || loading ? (
          <Grid style={{ textAlign: 'center', padding: '40px' }}>
            <CircularProgress />
          </Grid>
        ) : (
          <Card>
            <Scrollbar>
              {sentOrders && sentOrders.length > 0 ? (
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
                              {orderItem.receiverProvince?.name || 'N/A'}
                            </TableCell>
                            <TableCell align="left">
                              {orderItem.receiverUser?.name || orderItem.receiverUser?.email || 'N/A'}
                            </TableCell>
                            <TableCell align="left">
                              <Label color={getStatusColor(orderItem.status)}>
                                {orderItem.status?.toUpperCase()}
                              </Label>
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
                  No sent orders found. Create your first transfer order.
                </Alert>
              )}
            </Scrollbar>
            {sentOrders && sentOrders.length > 0 && (
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

      {/* Create Order Modal */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Create Transfer Order</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Customer</InputLabel>
              <Select
                value={orderData.customer_id}
                label="Customer"
                onChange={(e) => setOrderData({ ...orderData, customer_id: e.target.value })}
              >
                {customers.map((customer) => (
                  <MenuItem key={customer.id || customer._id} value={customer.id || customer._id}>
                    {customer.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Receiver Province</InputLabel>
              <Select
                value={orderData.receiver_province_id}
                label="Receiver Province"
                onChange={(e) => {
                  setOrderData({
                    ...orderData,
                    receiver_province_id: e.target.value,
                    receiver_user_id: '', // Reset user selection when province changes
                  });
                }}
              >
                {provinces
                  .filter((p) => (p.id || p._id) !== user?.province_id)
                  .map((province) => (
                    <MenuItem key={province.id || province._id} value={province.id || province._id}>
                      {province.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            {orderData.receiver_province_id && (
              <FormControl fullWidth required>
                <InputLabel>Receiver Province User</InputLabel>
                <Select
                  value={orderData.receiver_user_id}
                  label="Receiver Province User"
                  onChange={(e) => setOrderData({ ...orderData, receiver_user_id: e.target.value })}
                >
                  {getProvinceUsers().length > 0 ? (
                    getProvinceUsers().map((provinceUser) => (
                      <MenuItem key={provinceUser.id || provinceUser._id} value={provinceUser.id || provinceUser._id}>
                        {provinceUser.name} {provinceUser.email ? `(${provinceUser.email})` : ''}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No province users found in selected province</MenuItem>
                  )}
                </Select>
              </FormControl>
            )}

            <TextField
              fullWidth
              label="Item/Product Name"
              value={orderData.item}
              onChange={(e) => setOrderData({ ...orderData, item: e.target.value })}
              required
            />

            <TextField
              fullWidth
              label="Quantity"
              type="number"
              value={orderData.quantity}
              onChange={(e) => setOrderData({ ...orderData, quantity: e.target.value })}
              required
              inputProps={{ min: 1 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button onClick={handleCreateOrder} variant="contained">
            Create Order
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SendOrdersPage;

