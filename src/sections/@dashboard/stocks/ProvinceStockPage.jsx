import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
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
} from '@mui/material';
import { useAuth } from '../../../hooks/useAuth';
import Scrollbar from '../../../components/scrollbar';
import Label from '../../../components/label';
import { fetchCustomers } from '../../../store/slices/action';
import { applySortFilter, getComparator } from '../../../utils/tableOperations';
import { apiUrl, routes } from '../../../constants';

const TABLE_HEAD = [
  { id: 'customer', label: 'Customer', alignRight: false },
  { id: 'item', label: 'Item', alignRight: false },
  { id: 'quantity', label: 'Quantity', alignRight: false },
  { id: 'province', label: 'Province', alignRight: false },
  { id: 'date', label: 'Date', alignRight: false },
];

const ProvinceStockPage = () => {
  const { tokens, user } = useAuth();
  const dispatch = useDispatch();
  const { stocks } = useSelector((state) => state.stocks);
  const { customers } = useSelector((state) => state.customers);

  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('date');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [customerFilter, setCustomerFilter] = useState('all');

  useEffect(() => {
    if (tokens && tokens.access && tokens.access.token && user?.province_id) {
      loadData();
      dispatch(fetchCustomers(tokens.access.token));
    }
  }, [tokens, dispatch, user, customerFilter]);

  const loadData = () => {
    if (tokens && tokens.access && tokens.access.token && user?.province_id) {
      const params = { province_id: user.province_id };
      if (customerFilter !== 'all') {
        params.customer_id = customerFilter;
      }

      axios
        .get(apiUrl(routes.STOCK), {
          params,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokens.access.token}`,
          },
        })
        .then((response) => {
          dispatch({ type: 'stocks/setStocks', payload: response.data.results || response.data });
          setIsTableLoading(false);
        })
        .catch((error) => {
          toast.error(error.response?.data?.message || 'Error loading stocks');
          setIsTableLoading(false);
        });
    }
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find((c) => (c.id || c._id) === customerId);
    return customer?.name || 'N/A';
  };

  let filteredStocks = stocks || [];
  if (customerFilter !== 'all') {
    filteredStocks = filteredStocks.filter((s) => (s.customer_id || s.customer?.id) === parseInt(customerFilter, 10));
  }

  filteredStocks = applySortFilter(filteredStocks, getComparator(order, orderBy), '');

  return (
    <>
      <Helmet>
        <title>Province Stock</title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h3" gutterBottom>
            Stock in {user?.province_id ? 'Your Province' : 'Province'}
          </Typography>
        </Stack>

        <Card sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} sx={{ p: 3 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Customer</InputLabel>
              <Select value={customerFilter} label="Filter by Customer" onChange={(e) => setCustomerFilter(e.target.value)}>
                <MenuItem value="all">All Customers</MenuItem>
                {customers.map((customer) => (
                  <MenuItem key={customer.id || customer._id} value={customer.id || customer._id}>
                    {customer.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Card>

        {isTableLoading ? (
          <Grid style={{ textAlign: 'center', padding: '40px' }}>
            <CircularProgress />
          </Grid>
        ) : (
          <Card>
            <Scrollbar>
              {filteredStocks && filteredStocks.length > 0 ? (
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
                      {filteredStocks
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((stock) => (
                          <TableRow hover key={stock.id || stock._id}>
                            <TableCell align="left">
                              {stock.customer?.name || getCustomerName(stock.customer_id)}
                            </TableCell>
                            <TableCell align="left">{stock.item_type}</TableCell>
                            <TableCell align="left">
                              <Chip label={stock.quantity} color="primary" variant="outlined" />
                            </TableCell>
                            <TableCell align="left">
                              <Chip
                                label={stock.Province?.name || 'N/A'}
                                color="info"
                                variant="outlined"
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="left">
                              {new Date(stock.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info" sx={{ m: 2 }}>
                  No stock found in your province.
                </Alert>
              )}
            </Scrollbar>
            {filteredStocks && filteredStocks.length > 0 && (
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredStocks.length}
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

export default ProvinceStockPage;

