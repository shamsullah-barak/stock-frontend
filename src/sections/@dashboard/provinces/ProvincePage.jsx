import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';

import {
  Button,
  Card,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  MenuItem,
  Popover,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Typography,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Box,
  Modal,
} from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import { useAuth } from '../../../hooks/useAuth';

import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import Label from '../../../components/label';
import UserListHead from '../user/UserListHead';
import { applySortFilter, getComparator } from '../../../utils/tableOperations';
import { fetchProvinces, createProvince, updateProvince, deleteProvince } from '../../../store/slices/action';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Province Name', alignRight: false },
  { id: 'code', label: 'Code', alignRight: false },
  { id: '', label: '', alignRight: false },
];

// ----------------------------------------------------------------------

const ProvincePage = () => {
  const { tokens } = useAuth();
  const dispatch = useDispatch();
  const { provinces, loading } = useSelector((state) => state.provinces);

  // State variables
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Data
  const [province, setProvince] = useState({
    name: '',
    code: '',
  });
  const [selectedProvinceId, setSelectedProvinceId] = useState(null);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdateForm, setIsUpdateForm] = useState(false);

  // Load data on initial page load
  useEffect(() => {
    loadProvinces();
  }, []);

  // API operations
  const loadProvinces = () => {
    if (tokens) {
      dispatch(fetchProvinces(tokens.access.token))
        .then(() => {
          setIsTableLoading(false);
        })
        .catch((error) => {
          toast.error(error.response?.data?.message || 'Error loading provinces');
          setIsTableLoading(false);
        });
    }
  };

  const addProvince = () => {
    if (!province.name || !province.code) {
      toast.error('Please fill in all required fields');
      return;
    }

    dispatch(createProvince(province, tokens.access.token))
      .then(() => {
        toast.success('Province added');
        handleCloseModal();
        loadProvinces();
        clearForm();
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || 'Something went wrong, please try again');
      });
  };

  const updateProvinceHandler = () => {
    if (!province.name || !province.code) {
      toast.error('Please fill in all required fields');
      return;
    }

    dispatch(updateProvince(selectedProvinceId, province, tokens.access.token))
      .then(() => {
        toast.success('Province updated');
        handleCloseModal();
        handleCloseMenu();
        loadProvinces();
        clearForm();
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || 'Something went wrong, please try again');
      });
  };

  const deleteProvinceHandler = (provinceId) => {
    dispatch(deleteProvince(provinceId, tokens.access.token))
      .then(() => {
        toast.success('Province deleted');
        handleCloseDialog();
        handleCloseMenu();
        loadProvinces();
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || 'Something went wrong, please try again');
      });
  };

  const getSelectedProvinceDetails = () => {
    const selectedProvince = provinces.find((element) => (element.id || element._id) === selectedProvinceId);
    setProvince({
      name: selectedProvince.name || '',
      code: selectedProvince.code || '',
    });
  };

  const clearForm = () => {
    setProvince({
      name: '',
      code: '',
    });
  };

  // Handler functions
  const handleOpenMenu = (event) => {
    setIsMenuOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(null);
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
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

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    clearForm();
  };

  const filteredProvinces = applySortFilter(provinces, getComparator(order, orderBy), filterName);

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'white',
    borderRadius: '20px',
    boxShadow: 16,
    p: 4,
  };

  return (
    <>
      <Helmet>
        <title>Provinces</title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h3" gutterBottom>
            Provinces
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setIsUpdateForm(false);
              handleOpenModal();
            }}
            startIcon={<Iconify icon="eva:plus-fill" />}
          >
            New Province
          </Button>
        </Stack>
        {isTableLoading || loading ? (
          <Grid style={{ textAlign: 'center' }}>
            <CircularProgress size="lg" />
          </Grid>
        ) : (
          <Card>
            <Scrollbar>
              {provinces && provinces.length > 0 ? (
                <TableContainer sx={{ minWidth: 800 }}>
                  <Table>
                    <UserListHead
                      order={order}
                      orderBy={orderBy}
                      headLabel={TABLE_HEAD}
                      rowCount={provinces.length}
                      onRequestSort={handleRequestSort}
                    />
                    <TableBody>
                      {filteredProvinces
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((provinceItem) => (
                          <TableRow hover key={provinceItem._id || provinceItem.id} tabIndex={-1}>
                            <TableCell align="left">{provinceItem.name}</TableCell>
                            <TableCell align="left">
                              {/* <Label color="info">{provinceItem.code}</Label> */}
                              {provinceItem.code}
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="large"
                                color="inherit"
                                onClick={(e) => {
                                  setSelectedProvinceId(provinceItem.id || provinceItem._id);
                                  handleOpenMenu(e);
                                }}
                              >
                                <MoreVert />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="warning" color="warning">
                  No provinces found
                </Alert>
              )}
            </Scrollbar>
            {provinces && provinces.length > 0 && (
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredProvinces.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            )}
          </Card>
        )}
      </Container>

      <Popover
        open={Boolean(isMenuOpen)}
        anchorEl={isMenuOpen}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 1,
            width: 140,
            '& .MuiMenuItem-root': {
              px: 1,
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            setIsUpdateForm(true);
            getSelectedProvinceDetails();
            handleCloseMenu();
            handleOpenModal();
          }}
        >
          <Iconify icon={'eva:edit-fill'} sx={{ mr: 2 }} />
          Edit
        </MenuItem>

        <MenuItem sx={{ color: 'error.main' }} onClick={handleOpenDialog}>
          <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover>

      {/* Province Form Modal */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Container>
            <Typography variant="h4" textAlign="center" paddingBottom={2} paddingTop={1}>
              {isUpdateForm ? <span>Update</span> : <span>Add</span>} Province
            </Typography>
            <Stack spacing={3} paddingY={2}>
              <TextField
                fullWidth
                name="name"
                label="Province Name"
                value={province.name}
                autoFocus
                required
                onChange={(e) =>
                  setProvince({
                    ...province,
                    name: e.target.value,
                  })
                }
              />
              <TextField
                fullWidth
                name="code"
                label="Province Code"
                value={province.code}
                required
                onChange={(e) =>
                  setProvince({
                    ...province,
                    code: e.target.value,
                  })
                }
                helperText="Unique code for the province (e.g., PROV001)"
              />
              <br />
              <Box textAlign="center">
                <Button
                  size="large"
                  variant="contained"
                  onClick={isUpdateForm ? updateProvinceHandler : addProvince}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirm action</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this province?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>No</Button>
          <Button onClick={() => deleteProvinceHandler(selectedProvinceId)} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProvincePage;
