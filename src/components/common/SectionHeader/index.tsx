import React from 'react';
import {
    Box,
    TextField,
    InputAdornment,
    IconButton,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { Search, Zap } from 'lucide-react';

interface Props {
    value: string;
    onChange: (value: string) => void;
    onSmartClick: () => void;
}

const SearchBar: React.FC<Props> = ({
    value,
    onChange,
    onSmartClick
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box
            sx={{
                maxWidth: 700,
                mx: 'auto',
                mb: { xs: 4, sm: 8 },
                display: 'flex',
                gap: 1.5
            }}
        >
            <TextField
                fullWidth
                placeholder={
                    isMobile ? 'Search...' : 'Search the aesthetic archive...'
                }
                value={value}
                onChange={(e) => onChange(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search size={18} />
                        </InputAdornment>
                    ),
                    sx: { borderRadius: '100px' }
                }}
            />

            <IconButton
                onClick={onSmartClick}
                sx={{
                    bgcolor: 'text.primary',
                    color: 'secondary.main',
                    width: 56,
                    height: 56
                }}
            >
                <Zap size={22} fill="currentColor" />
            </IconButton>
        </Box>
    );
};

export default SearchBar;