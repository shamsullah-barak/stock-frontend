import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  Avatar,
  Button,
  Card,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
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
  Box,
  Chip,
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import { useAuth } from '../../../hooks/useAuth';
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import Label from '../../../components/label';
import { fetchCustomerStocks, createStockRequest } from '../../../store/slices/action';
import { applySortFilter, getComparator } from '../../../utils/tableOperations';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'itemName', label: 'Item Name', alignRight: false },
  { id: 'quantity', label: 'Quantity', alignRight: false },
  { id: 'unit', label: 'Unit', alignRight: false },
  { id: 'province', label: 'Province', alignRight: false },
  { id: 'actions', label: 'Actions', alignRight: false },
];

// ----------------------------------------------------------------------

const Stocks = () => {
  const { user, tokens } = useAuth();
  const dispatch = useDispatch();
  const { stocks, loading } = useSelector((state) => state.stocks);

  // State variables
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('itemName');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [requestData, setRequestData] = useState({
    itemName: '',
    quantity: '',
    unit: '',
    notes: '',
  });

  // Load data on initial page load
  useEffect(() => {
    if (user && user.province_id) {
      loadStocks();
    }
  }, [user]);

  const loadStocks = () => {
    if (user && user.id && user.province_id && tokens) {
      dispatch(fetchCustomerStocks(user.id, user.province_id, tokens.access.token));
    }
  };

  const handleOpenAddDialog = () => {
    setRequestData({
      itemName: '',
      quantity: '',
      unit: '',
      notes: '',
    });
    setIsAddDialogOpen(true);
  };

  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false);
    setRequestData({
      itemName: '',
      quantity: '',
      unit: '',
      notes: '',
    });
  };

  const handleOpenRemoveDialog = (stock) => {
    setSelectedStock(stock);
    setRequestData({
      quantity: '',
      notes: '',
    });
    setIsRemoveDialogOpen(true);
  };

  const handleCloseRemoveDialog = () => {
    setIsRemoveDialogOpen(false);
    setSelectedStock(null);
    setRequestData({
      quantity: '',
      notes: '',
    });
  };

  const handleRequestAddStock = async () => {
    try {
      if (!requestData.itemName || !requestData.quantity || !requestData.unit) {
        toast.error('Please fill in all required fields');
        return;
      }

      const requestPayload = {
        request_type: 'add',
        province_id: user.province_id,
        item: requestData.itemName,
        quantity: parseInt(requestData.quantity, 10),
      };

      await dispatch(createStockRequest(requestPayload, tokens.access.token)).unwrap();
      toast.success('Stock add request submitted successfully');
      handleCloseAddDialog();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    }
  };

  const handleRequestRemoveStock = async () => {
    try {
      if (!requestData.quantity || parseInt(requestData.quantity, 10) > selectedStock.quantity) {
        toast.error('Invalid quantity. Cannot remove more than available stock');
        return;
      }

      const requestPayload = {
        request_type: 'remove',
        province_id: user.province_id,
        item: selectedStock.itemName,
        quantity: parseInt(requestData.quantity, 10),
      };

      await dispatch(createStockRequest(requestPayload, tokens.access.token)).unwrap();
      toast.success('Stock remove request submitted successfully');
      handleCloseRemoveDialog();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    }
  };

  // Table functions
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const filteredStocks = applySortFilter(stocks, getComparator(order, orderBy), filterName);

  return (
    <>
      <Helmet>
        <title>My Stocks</title>
      </Helmet>

      <Container>
        {/* <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h3" gutterBottom>
            My Stocks
          </Typography>
          <Button variant="contained" onClick={handleOpenAddDialog} startIcon={<Iconify icon="eva:plus-fill" />}>
            Request Add Stock
          </Button>
        </Stack> */}

        {loading ? (
          <Grid container justifyContent="center" style={{ padding: '40px' }}>
            <CircularProgress />
          </Grid>
        ) : (
          <Card>
            <Scrollbar>
              {stocks && stocks.length > 0 ? (
                <TableContainer sx={{ minWidth: 800 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        {TABLE_HEAD.map((headCell) => (
                          <TableCell
                            key={headCell.id}
                            align={headCell.alignRight ? 'right' : 'left'}
                            sortDirection={orderBy === headCell.id ? order : false}
                          >
                            {headCell.label}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredStocks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((stock) => (
                        <TableRow hover key={stock.id || stock._id} tabIndex={-1}>
                          <TableCell align="left">{stock.itemName}</TableCell>
                          <TableCell align="left">
                            <Chip label={stock.quantity} color="primary" variant="outlined" />
                          </TableCell>
                          <TableCell align="left">{stock.unit}</TableCell>
                          <TableCell align="left">{stock.provinceName || user.provinceName}</TableCell>
                          <TableCell align="right">
                            <IconButton
                              color="error"
                              onClick={() => handleOpenRemoveDialog(stock)}
                              disabled={stock.quantity === 0}
                            >
                              <Remove />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info" sx={{ m: 2 }}>
                  No stocks found. Request to add your first stock item.
                </Alert>
              )}
            </Scrollbar>
            {stocks && stocks.length > 0 && (
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredStocks.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            )}
          </Card>
        )}
      </Container>

      {/* Add Stock Request Dialog */}
      <Dialog open={isAddDialogOpen} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Request to Add Stock</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Item Name"
              value={requestData.itemName}
              onChange={(e) => setRequestData({ ...requestData, itemName: e.target.value })}
              required
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Quantity"
                  type="number"
                  value={requestData.quantity}
                  onChange={(e) => setRequestData({ ...requestData, quantity: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Unit"
                  value={requestData.unit}
                  onChange={(e) => setRequestData({ ...requestData, unit: e.target.value })}
                  placeholder="e.g., kg, pieces, boxes"
                  required
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Notes (Optional)"
              multiline
              rows={3}
              value={requestData.notes}
              onChange={(e) => setRequestData({ ...requestData, notes: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button onClick={handleRequestAddStock} variant="contained">
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove Stock Request Dialog */}
      <Dialog open={isRemoveDialogOpen} onClose={handleCloseRemoveDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Request to Remove Stock</DialogTitle>
        <DialogContent>
          {selectedStock && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Item: {selectedStock.itemName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Available Quantity: {selectedStock.quantity} {selectedStock.unit}
                </Typography>
              </Box>
              <TextField
                fullWidth
                label="Quantity to Remove"
                type="number"
                value={requestData.quantity}
                onChange={(e) => setRequestData({ ...requestData, quantity: e.target.value })}
                inputProps={{ max: selectedStock.quantity, min: 1 }}
                required
                helperText={`Maximum: ${selectedStock.quantity} ${selectedStock.unit}`}
              />
              <TextField
                fullWidth
                label="Notes (Optional)"
                multiline
                rows={3}
                value={requestData.notes}
                onChange={(e) => setRequestData({ ...requestData, notes: e.target.value })}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemoveDialog}>Cancel</Button>
          <Button onClick={handleRequestRemoveStock} variant="contained" color="error">
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Stocks;
