import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import { fetchCustomerStocks, fetchProvinces } from '../../../store/slices/action';
import { applySortFilter, getComparator } from '../../../utils/tableOperations';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'itemName', label: 'Item Name', alignRight: false },
  { id: 'quantity', label: 'Quantity', alignRight: false },
  { id: 'province', label: 'Location (Province)', alignRight: false },
];

// ----------------------------------------------------------------------

const Stocks = () => {
  const { user, tokens } = useAuth();
  const dispatch = useDispatch();
  const { stocks, loading } = useSelector((state) => state.stocks);
  const { provinces } = useSelector((state) => state.provinces);

  // State variables
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('itemName');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [provinceFilter, setProvinceFilter] = useState('all');

  // Load data on initial page load
  useEffect(() => {
    if (user) {
      loadStocks();
      if (tokens && tokens.access && tokens.access.token) {
        dispatch(fetchProvinces(tokens.access.token));
      }
    }
  }, [user, provinceFilter]);

  const loadStocks = () => {
    if (user && user.id && tokens && tokens.access && tokens.access.token) {
      const provinceId = provinceFilter !== 'all' ? parseInt(provinceFilter, 10) : null;
      dispatch(fetchCustomerStocks(user.id, provinceId, tokens.access.token));
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
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h3" gutterBottom>
            My Stocks
          </Typography>
        </Stack>

        <Card sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} sx={{ p: 3 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Province</InputLabel>
              <Select
                value={provinceFilter}
                label="Filter by Province"
                onChange={(e) => setProvinceFilter(e.target.value)}
              >
                <MenuItem value="all">All Provinces</MenuItem>
                {provinces.map((province) => (
                  <MenuItem key={province.id || province._id} value={province.id || province._id}>
                    {province.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Card>

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
                          <TableCell align="left">{stock.item_type || stock.itemName}</TableCell>
                          <TableCell align="left">
                            <Chip label={stock.quantity} color="primary" variant="outlined" />
                          </TableCell>
                          <TableCell align="left">
                            <Chip 
                              label={stock.Province?.name || stock.provinceName || 'N/A'} 
                              color="info" 
                              variant="outlined" 
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info" sx={{ m: 2 }}>
                  No stocks found.
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
    </>
  );
};

export default Stocks;
