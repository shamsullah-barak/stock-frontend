import React, { Fragment, useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import PropTypes from 'prop-types';
import { MdCategory } from 'react-icons/md';
import { NavLink as RouterLink } from 'react-router-dom';
import { Box, List, ListItemButton, ListItemText } from '@mui/material';
import { StyledNavItem, StyledNavItemIcon } from './styles';
// ----------------------------------------------------------------------

NavSection.propTypes = {
  data: PropTypes.array,
};

export default function NavSection({ data = [], innerData = [], ...other }) {
  const [collapse, setCollapse] = useState(false);

  return (
    <Box {...other}>
      <List disablePadding sx={{ p: 1 }}>
        {data.map((item, index) => (
          <Fragment key={index}>
            {item.title === 'Categories' ? (
              <>
                <NavButton key={item.title} item={item} collapse={collapse} setCollapse={setCollapse} />
                {collapse && (
                  <>
                    {innerData.map((innerItem, index) => {
                      return <InnerNavItem key={index} item={innerItem} />;
                    })}
                  </>
                )}
              </>
            ) : (
              <>
                <NavItem key={item.title} item={item} />
              </>
            )}
          </Fragment>
        ))}
      </List>
    </Box>
  );
}

// ----------------------------------------------------------------------

function NavItem(props) {
  const { title, path, icon, info } = props.item;

  return (
    <StyledNavItem
      component={RouterLink}
      to={path}
      sx={{
        '&.active': {
          color: 'white',
          bgcolor: 'black',
          fontWeight: 'fontWeightBold',
        },
      }}
      onClick={props.onClick}
    >
      <StyledNavItemIcon>{icon && icon}</StyledNavItemIcon>
      <ListItemText disableTypography primary={title} />
      {info && info}
    </StyledNavItem>
  );
}

const InnerNavItem = ({ item }) => {
  const { title, path, icon, info } = item;

  return (
    <StyledNavItem
      component={RouterLink}
      to={path}
      sx={{
        '&.active': {
          color: 'white',
          bgcolor: 'black',
          fontWeight: 'fontWeightBold',
        },
      }}
      style={{ marginLeft: '40px' }}
    >
      <MdCategory size={20} style={{ marginRight: '10px' }} />
      <ListItemText disableTypography primary={title} />

      {info && info}
    </StyledNavItem>
  );
};

const NavButton = ({ item, collapse, setCollapse }) => {
  return (
    <ListItemButton
      sx={{
        '&.active': {
          color: 'text.primary',
          bgcolor: 'action.selected',
          fontWeight: 'fontWeightBold',
        },
      }}
      style={{
        height: 48,
        position: 'relative',
        textTransform: 'capitalize',
        borderRadius: '6px',
      }}
      onClick={() => setCollapse(!collapse)}
    >
      {collapse ? <FiChevronUp style={{ marginRight: '20px' }} /> : <FiChevronDown style={{ marginRight: '20px' }} />}
      {item.title}
    </ListItemButton>
  );
};

NavItem.propTypes = {
  item: PropTypes.object,
};
