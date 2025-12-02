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
  TextField,
  Typography,
  Alert,
  Chip,
} from '@mui/material';
import { useAuth } from '../../../hooks/useAuth';
import Iconify from '../../../components/iconify';
import { fetchCustomerStocks, createOrder, fetchProvinces } from '../../../store/slices/action';

const SaleOrderPage = () => {
  const { tokens, user } = useAuth();
  const dispatch = useDispatch();
  const { stocks } = useSelector((state) => state.stocks);
  const { provinces } = useSelector((state) => state.provinces);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [orderData, setOrderData] = useState({
    receiver_province_id: '',
    item: '',
    quantity: '',
    price: '',
    buyer_info: '',
  });
  const [availableQuantity, setAvailableQuantity] = useState(0);

  useEffect(() => {
    if (tokens && tokens.access && tokens.access.token && user) {
      loadData();
    }
  }, [tokens, dispatch, user]);

  const loadData = () => {
    if (tokens && tokens.access && tokens.access.token && user) {
      dispatch(fetchCustomerStocks(user.id, null, tokens.access.token))
        .then(() => setIsLoading(false))
        .catch(() => setIsLoading(false));
      dispatch(fetchProvinces(tokens.access.token));
    }
  };

  const handleOpenModal = () => {
    setOrderData({
      receiver_province_id: '',
      item: '',
      quantity: '',
      price: '',
      buyer_info: '',
    });
    setAvailableQuantity(0);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setOrderData({
      receiver_province_id: '',
      item: '',
      quantity: '',
      price: '',
      buyer_info: '',
    });
    setAvailableQuantity(0);
  };

  const handleItemChange = (itemType) => {
    // Find all stocks with this item type
    const matchingStocks = stocks.filter((s) => s.item_type === itemType);
    
    if (matchingStocks.length > 0) {
      // Get total available quantity across all provinces
      const totalQuantity = matchingStocks.reduce((sum, s) => sum + (s.quantity || 0), 0);
      setAvailableQuantity(totalQuantity);
      
      // Set the first stock's province as default (user can change it)
      const firstStock = matchingStocks[0];
      setOrderData({
        ...orderData,
        item: itemType,
        receiver_province_id: firstStock.province_id || firstStock.current_location || '',
      });
    }
  };

  const handleCreateSaleOrder = async () => {
    if (!tokens || !tokens.access || !tokens.access.token) {
      toast.error('Authentication required');
      return;
    }

    if (!orderData.receiver_province_id || !orderData.item || !orderData.quantity || !orderData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate: Customer can only create sale order if stock is in the selected province
    const stockInProvince = stocks.find(
      (s) =>
        s.item_type === orderData.item &&
        (s.province_id === parseInt(orderData.receiver_province_id, 10) ||
          s.current_location === parseInt(orderData.receiver_province_id, 10))
    );

    if (!stockInProvince) {
      toast.error('You can only create sale orders for stock that is in the selected province');
      return;
    }

    const availableInProvince = stockInProvince.quantity || 0;
    if (parseInt(orderData.quantity, 10) > availableInProvince) {
      toast.error(`Insufficient stock in selected province. Available: ${availableInProvince}`);
      return;
    }

    try {
      const orderPayload = {
        customer_id: user.id,
        receiver_province_id: parseInt(orderData.receiver_province_id, 10),
        item: orderData.item,
        quantity: parseInt(orderData.quantity, 10),
        price: parseFloat(orderData.price),
        order_type: 'sale',
        buyer_info: orderData.buyer_info || '',
      };

      await dispatch(createOrder(orderPayload, tokens.access.token));
      toast.success('Sale order created successfully');
      handleCloseModal();
      loadData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create sale order';
      console.error('Sale order creation error:', error);
      toast.error(errorMessage);
    }
  };

  const uniqueItems = [...new Set(stocks.map((s) => s.item_type))];

  return (
    <>
      <Helmet>
        <title>Create Sale Order</title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h3" gutterBottom>
            Create Sale Order
          </Typography>
          <Button variant="contained" onClick={handleOpenModal} startIcon={<Iconify icon="eva:plus-fill" />}>
            New Sale Order
          </Button>
        </Stack>

        <Card sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Available Stock
          </Typography>
          {isLoading ? (
            <CircularProgress />
          ) : stocks && stocks.length > 0 ? (
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {stocks.map((stock) => (
                <Grid item xs={12} sm={6} md={4} key={stock.id || stock._id}>
                  <Card sx={{ p: 2 }}>
                    <Stack spacing={1}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {stock.item_type}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip label={`Qty: ${stock.quantity}`} color="primary" />
                        <Chip
                          label={stock.Province?.name || 'N/A'}
                          color="info"
                          variant="outlined"
                          size="small"
                        />
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info" sx={{ mt: 2 }}>
              No stock available. Stock will appear here once transfer orders are accepted.
            </Alert>
          )}
        </Card>
      </Container>

      {/* Create Sale Order Modal */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Create Sale Order</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Select Item</InputLabel>
              <Select
                value={orderData.item}
                label="Select Item"
                onChange={(e) => handleItemChange(e.target.value)}
              >
                {uniqueItems.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {orderData.item && (
              <>
                <Alert severity="info">
                  Available Quantity: <strong>{availableQuantity}</strong>
                </Alert>

                <FormControl fullWidth required>
                  <InputLabel>Province (Where Stock Is Located)</InputLabel>
                  <Select
                    value={orderData.receiver_province_id}
                    label="Province (Where Stock Is Located)"
                    onChange={(e) => {
                      const selectedProvinceId = parseInt(e.target.value, 10);
                      // Validate stock exists in selected province
                      const stockInProvince = stocks.find(
                        (s) =>
                          s.item_type === orderData.item &&
                          (s.province_id === selectedProvinceId || s.current_location === selectedProvinceId)
                      );
                      if (stockInProvince) {
                        setAvailableQuantity(stockInProvince.quantity || 0);
                        setOrderData({ ...orderData, receiver_province_id: e.target.value });
                      } else {
                        toast.error('You do not have stock of this item in the selected province');
                      }
                    }}
                  >
                    {stocks
                      .filter((s) => s.item_type === orderData.item)
                      .map((stock) => {
                        const provinceId = stock.province_id || stock.current_location;
                        const province = provinces.find((p) => (p.id || p._id) === provinceId);
                        return province ? (
                          <MenuItem key={province.id || province._id} value={province.id || province._id}>
                            {province.name} (Available: {stock.quantity})
                          </MenuItem>
                        ) : null;
                      })}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Quantity"
                  type="number"
                  value={orderData.quantity}
                  onChange={(e) => setOrderData({ ...orderData, quantity: e.target.value })}
                  required
                  inputProps={{ min: 1, max: availableQuantity }}
                  helperText={`Maximum: ${availableQuantity}`}
                />

                <TextField
                  fullWidth
                  label="Price (Amount to Receive)"
                  type="number"
                  value={orderData.price}
                  onChange={(e) => setOrderData({ ...orderData, price: e.target.value })}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />

                <TextField
                  fullWidth
                  label="Buyer Information (Optional)"
                  multiline
                  rows={3}
                  value={orderData.buyer_info}
                  onChange={(e) => setOrderData({ ...orderData, buyer_info: e.target.value })}
                />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button onClick={handleCreateSaleOrder} variant="contained" disabled={!orderData.item}>
            Create Sale Order
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SaleOrderPage;

