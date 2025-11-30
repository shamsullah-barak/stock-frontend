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
  Typography,
  Alert,
  Box,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Check, Close } from '@mui/icons-material';
import { useAuth } from '../../../hooks/useAuth';
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import Label from '../../../components/label';
import { fetchStockRequests, updateStockRequest } from '../../../store/slices/action';
import { applySortFilter, getComparator } from '../../../utils/tableOperations';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'type', label: 'Type', alignRight: false },
  { id: 'customerName', label: 'Customer', alignRight: false },
  { id: 'itemName', label: 'Item Name', alignRight: false },
  { id: 'quantity', label: 'Quantity', alignRight: false },
  { id: 'unit', label: 'Unit', alignRight: false },
  { id: 'notes', label: 'Notes', alignRight: false },
  { id: 'date', label: 'Date', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: 'actions', label: 'Actions', alignRight: false },
];

// ----------------------------------------------------------------------

const ManageStocks = () => {
  const { user, tokens } = useAuth();
  const dispatch = useDispatch();
  const { requests, loading } = useSelector((state) => state.stockRequests);

  // State variables
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('date');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'

  // Load data on initial page load
  useEffect(() => {
    if (user && user.provinceId) {
      loadRequests();
    }
  }, [user, statusFilter]);

  const loadRequests = () => {
    if (user && user.provinceId && tokens) {
      const status = statusFilter === 'all' ? undefined : statusFilter;
      dispatch(fetchStockRequests(user.provinceId, status, tokens.access.token));
    }
  };

  const handleOpenConfirmDialog = (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setIsConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setIsConfirmDialogOpen(false);
    setSelectedRequest(null);
    setActionType('');
  };

  const handleConfirmRequest = async () => {
    try {
      const newStatus = actionType === 'approve' ? 'approved' : 'rejected';
      await dispatch(
        updateStockRequest(selectedRequest.id || selectedRequest._id, newStatus, tokens.access.token)
      ).unwrap();
      toast.success(`Request ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`);
      handleCloseConfirmDialog();
      loadRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${actionType} request`);
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

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const filteredRequests = applySortFilter(requests, getComparator(order, orderBy), filterName);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type) => {
    return type === 'add' ? 'success' : 'error';
  };

  return (
    <>
      <Helmet>
        <title>Manage Stock Requests</title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h3" gutterBottom>
            Manage Stock Requests
          </Typography>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select value={statusFilter} label="Filter by Status" onChange={handleStatusFilterChange}>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="all">All</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {loading ? (
          <Grid container justifyContent="center" style={{ padding: '40px' }}>
            <CircularProgress />
          </Grid>
        ) : (
          <Card>
            <Scrollbar>
              {requests && requests.length > 0 ? (
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
                      {filteredRequests
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((request) => (
                          <TableRow hover key={request.id || request._id} tabIndex={-1}>
                            <TableCell align="left">
                              <Chip
                                label={request.type === 'add' ? 'Add' : 'Remove'}
                                color={getTypeColor(request.type)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="left">
                              {request.customerName || request.customer?.name || 'N/A'}
                            </TableCell>
                            <TableCell align="left">{request.itemName}</TableCell>
                            <TableCell align="left">
                              <Chip label={request.quantity} color="primary" variant="outlined" />
                            </TableCell>
                            <TableCell align="left">{request.unit}</TableCell>
                            <TableCell align="left">
                              {request.notes ? (
                                <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>
                                  {request.notes}
                                </Typography>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell align="left">
                              {request.createdAt
                                ? new Date(request.createdAt).toLocaleDateString()
                                : new Date(request.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell align="left">
                              <Label color={getStatusColor(request.status)}>
                                {request.status?.toUpperCase() || 'PENDING'}
                              </Label>
                            </TableCell>
                            <TableCell align="right">
                              {request.status === 'pending' && (
                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                  <IconButton
                                    color="success"
                                    size="small"
                                    onClick={() => handleOpenConfirmDialog(request, 'approve')}
                                  >
                                    <Check />
                                  </IconButton>
                                  <IconButton
                                    color="error"
                                    size="small"
                                    onClick={() => handleOpenConfirmDialog(request, 'reject')}
                                  >
                                    <Close />
                                  </IconButton>
                                </Stack>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info" sx={{ m: 2 }}>
                  No stock requests found.
                </Alert>
              )}
            </Scrollbar>
            {requests && requests.length > 0 && (
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredRequests.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            )}
          </Card>
        )}
      </Container>

      {/* Confirm/Reject Dialog */}
      <Dialog open={isConfirmDialogOpen} onClose={handleCloseConfirmDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'approve' ? 'Approve' : 'Reject'} Stock Request
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Request Type:
                </Typography>
                <Chip
                  label={selectedRequest.type === 'add' ? 'Add Stock' : 'Remove Stock'}
                  color={getTypeColor(selectedRequest.type)}
                  size="small"
                />
              </Box>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Customer:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedRequest.customerName || selectedRequest.customer?.name || 'N/A'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Item Name:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedRequest.itemName}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Quantity:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedRequest.quantity} {selectedRequest.unit}
                </Typography>
              </Box>
              {selectedRequest.notes && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Notes:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedRequest.notes}
                  </Typography>
                </Box>
              )}
              <Alert severity={actionType === 'approve' ? 'success' : 'warning'}>
                Are you sure you want to {actionType} this request?
              </Alert>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Cancel</Button>
          <Button
            onClick={handleConfirmRequest}
            variant="contained"
            color={actionType === 'approve' ? 'success' : 'error'}
          >
            {actionType === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ManageStocks;
