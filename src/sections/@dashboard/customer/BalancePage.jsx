import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  Card,
  CircularProgress,
  Container,
  Grid,
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
  Box,
} from '@mui/material';
import { useAuth } from '../../../hooks/useAuth';
import Scrollbar from '../../../components/scrollbar';
import Label from '../../../components/label';
import { fetchCustomerBalance, fetchCustomerTransactions } from '../../../store/slices/action';

const BalancePage = () => {
  const { tokens } = useAuth();
  const dispatch = useDispatch();
  const { balance, transactions, loading } = useSelector((state) => state.transactions);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (tokens && tokens.access && tokens.access.token) {
      loadData();
    }
  }, [tokens, dispatch]);

  const loadData = () => {
    if (tokens && tokens.access && tokens.access.token) {
      Promise.all([
        dispatch(fetchCustomerBalance(tokens.access.token)),
        dispatch(fetchCustomerTransactions(tokens.access.token)),
      ])
        .then(() => setIsLoading(false))
        .catch(() => setIsLoading(false));
    }
  };

  const getTransactionTypeColor = (type) => {
    return type === 'sale' ? 'success' : 'error';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <>
      <Helmet>
        <title>My Balance</title>
      </Helmet>

      <Container>
        <Typography variant="h3" gutterBottom sx={{ mb: 5 }}>
          My Balance
        </Typography>

        {isLoading || loading ? (
          <Grid style={{ textAlign: 'center', padding: '40px' }}>
            <CircularProgress />
          </Grid>
        ) : (
          <Grid container spacing={3}>
            {/* Balance Card */}
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Current Balance
                </Typography>
                <Typography variant="h3" color="primary.main" sx={{ fontWeight: 'bold', my: 2 }}>
                  ${parseFloat(balance?.balance || 0).toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Available for withdrawal
                </Typography>
              </Card>
            </Grid>

            {/* Transaction History */}
            <Grid item xs={12} md={8}>
              <Card>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Transaction History
                  </Typography>
                </Box>
                <Scrollbar>
                  {transactions && transactions.length > 0 ? (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Description</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {transactions
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((transaction) => (
                              <TableRow hover key={transaction.id || transaction._id}>
                                <TableCell>
                                  {new Date(transaction.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <Label color={getTransactionTypeColor(transaction.transaction_type)}>
                                    {transaction.transaction_type?.toUpperCase()}
                                  </Label>
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    variant="body2"
                                    color={transaction.transaction_type === 'sale' ? 'success.main' : 'error.main'}
                                    sx={{ fontWeight: 'bold' }}
                                  >
                                    {transaction.transaction_type === 'sale' ? '+' : '-'}$
                                    {parseFloat(transaction.amount).toFixed(2)}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={transaction.status?.toUpperCase()}
                                    color={getStatusColor(transaction.status)}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>{transaction.description || 'N/A'}</TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert severity="info" sx={{ m: 2 }}>
                      No transactions found.
                    </Alert>
                  )}
                </Scrollbar>
                {transactions && transactions.length > 0 && (
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={transactions.length}
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
            </Grid>
          </Grid>
        )}
      </Container>
    </>
  );
};

export default BalancePage;

