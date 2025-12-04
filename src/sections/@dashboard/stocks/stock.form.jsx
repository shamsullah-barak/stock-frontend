import {
  Box,
  Button,
  Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Modal,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
  Select,
  InputLabel,
  MenuItem,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import Iconify from '../../../components/iconify';
import { apiUrl, routes } from '../../../constants';
import { useAuth } from '../../../hooks/useAuth';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800,
  bgcolor: 'white',
  borderRadius: '20px',
  boxShadow: 16,
  p: 4,
};

const StockForm = ({ isUpdateForm, isModalOpen, handleCloseModal, handleUpdateStock, onStockAdded }) => {
  const { tokens, user } = useAuth();

  const addStock = () => {
    if (!tokens || !tokens.access || !tokens.access.token) {
      toast.error('Authentication required');
      return;
    }
    if (!stock.customer_id || !stock.receiver_id || !stock.item_name || !stock.quantity) {
      toast.error('Please fill in all required fields');
      return;
    }
    axios
      .post('https://stock-backend-l9bt.onrender.com/api/stock-requests', stock, {
        headers: {
          Authorization: `Bearer ${tokens.access.token}`,
        },
      })
      .then((response) => {
        toast.success('Stock request added');
        handleCloseModal();
        // Reset form
        setStock({
          receiver_id: '',
          customer_id: '',
          item_name: '',
          quantity: 1,
        });
        // Refresh the stock requests list
        if (onStockAdded) {
          onStockAdded();
        }
      })
      .catch((error) => {
        toast.error(error.response?.data?.message ?? 'Something went wrong, please try again');
      });
  };

  const { users } = useSelector((state) => state.users);
  const { provinces } = useSelector((state) => state.provinces);
  const { customers } = useSelector((state) => state.customers);

  const [stock, setStock] = useState({
    receiver_id: '',
    customer_id: '',
    item_name: '',
    quantity: 1,
  });

  return (
    <Modal
      open={isModalOpen}
      onClose={handleCloseModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Container>
          <Typography variant="h4" textAlign="center" paddingBottom={2} paddingTop={1}>
            {isUpdateForm ? <span>Update</span> : <span>Add</span>} stock
          </Typography>
          <Stack spacing={3} paddingY={2}>
            <Grid container spacing={0} sx={{ paddingBottom: '4px' }}>
              <Grid item xs={12} md={12}>
                <FormControl fullWidth required>
                  <InputLabel id="receiver-select-label">Receiver</InputLabel>
                  <Select
                    labelId="receiver-select-label"
                    id="receiver-select"
                    value={stock.receiver_id || ''}
                    label="Receiver"
                    onChange={(e) => setStock({ ...stock, receiver_id: e.target.value })}
                  >
                    {users
                      // Do not allow selecting the current logged-in province user as receiver
                      .filter(
                        (receiver) =>
                          (receiver.id || receiver._id) !== (user?.id || user?._id)
                      )
                      .map((receiver) => (
                        <MenuItem key={receiver.id || receiver._id} value={receiver.id || receiver._id}>
                          {receiver.name} ({receiver.code})
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={0} sx={{ paddingBottom: '4px' }}>
              <Grid item xs={12} md={6} paddingRight={1}>
                <FormControl fullWidth required>
                  <InputLabel id="customer-select-label">Customer</InputLabel>
                  <Select
                    labelId="customer-select-label"
                    id="customer-select"
                    value={stock.customer_id || ''}
                    label="Province"
                    onChange={(e) => setStock({ ...stock, customer_id: e.target.value })}
                  >
                    {customers.map((customer) => (
                      <MenuItem key={customer.id || customer._id} value={customer.id || customer._id}>
                        {customer.name}
                        {/* ({customer.code}) */}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6} paddingLeft={1}>
                <TextField
                  fullWidth
                  name="item_name"
                  label="item name"
                  type="text"
                  value={stock.item_name}
                  required
                  onChange={(e) => setStock({ ...stock, item_name: e.target.value })}
                />
              </Grid>
            </Grid>

            <Grid container spacing={0} sx={{ paddingBottom: '4px' }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="quantity"
                  label="Quantity"
                  type="number"
                  value={stock.quantity}
                  required
                  onChange={(e) => setStock({ ...stock, quantity: e.target.value })}
                />
              </Grid>
            </Grid>
            <br />
            <Box textAlign="center">
              <Button
                size="large"
                variant="contained"
                onClick={isUpdateForm ? handleUpdateStock : addStock}
                startIcon={<Iconify icon="bi:check-lg" />}
                style={{ marginRight: '12px' }}
              >
                Submit
              </Button>

              <Button
                size="large"
                color="inherit"
                variant="contained"
                onClick={handleCloseModal}
                startIcon={<Iconify icon="charm:cross" />}
                style={{ marginLeft: '12px' }}
              >
                Cancel
              </Button>
            </Box>
          </Stack>
        </Container>
      </Box>
    </Modal>
  );
};

StockForm.propTypes = {
  isUpdateForm: PropTypes.bool,
  isModalOpen: PropTypes.bool,
  handleCloseModal: PropTypes.func,
  stock: PropTypes.object,
  setStock: PropTypes.func,
  handleUpdateStock: PropTypes.func,
  onStockAdded: PropTypes.func,
  provinces: PropTypes.array,
};

export default StockForm;
