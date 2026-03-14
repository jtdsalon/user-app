import React, { useState, useMemo, useEffect, useRef, useDeferredValue, useCallback } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box, 
  IconButton, 
  Stepper, 
  Step, 
  StepLabel,
  Stack,
  Avatar,
  Paper,
  Grid2,
  keyframes,
  Divider,
  useTheme,
  useMediaQuery,
  Slide,
  CircularProgress,
  Tooltip,
  Fade,
  Tab,
  Tabs,
  Backdrop,
  Snackbar,
  Alert,
  TextField
} from '@mui/material';
import { X, Clock, Sparkles, Check, Camera, Users, Image as ImageIcon, Plus, Info, ChevronRight, LayoutGrid, Search, Maximize2, ZoomIn, ZoomOut, Move, Tag } from 'lucide-react';
import { Salon, Appointment, Artist, SalonService } from '../../Home/types';
import { TransitionProps } from '@mui/material/transitions';
import { optimizeImage } from '@/lib/util/imageProcessor';
import { getFullImageUrl } from '@/lib/util/imageUrl';
import { AvatarWithFallback } from '@/components/common/ImageWithFallback';
import { formatLKR } from '@/lib/utils/currency';
import { validatePromoCodeApi, createSlotHoldApi, releaseSlotHoldApi, type ValidatedPromo } from '@/services/api/bookingService';

interface VisualStyleSuggestion {
  id: string;
  name: string;
  category: string;
  image: string;
  vibe?: string;
}

export interface BookingRulesDisplay {
  min_notice_minutes?: number;
  max_advance_days?: number;
  free_cancellation_hours?: number;
  advance_payment_rule?: string | null;
  reschedule_hours?: number;
}

export interface BookingDataProps {
  services: Array<{ id: string; name: string; price: number; duration: number; category?: string; suggestedImages?: string[] }>;
  staff: Array<{ id: string; name: string; image?: string; role?: string }>;
  lookbook?: Array<{ id: string; image: string; name?: string; category?: string; vibe?: string }>;
  bookingRules?: BookingRulesDisplay | null;
  availability: Array<{ time: string; label: string }>;
  loading: boolean;
  availabilityLoading: boolean;
  submitLoading: boolean;
  error: string | null;
  submitError: string | null;
  loadAvailability: (staffId: string, dateStr: string, options?: { durationMinutes?: number; bufferMinutes?: number; serviceId?: string }) => void;
  submitBooking: (params: {
    salonId: string;
    serviceIds: string[];
    services: Array<{ id: string; price: number; duration: number; original_price?: number; promotion_id?: string }>;
    staffId?: string;
    selectedDate: string;
    selectedTime: string;
    notes?: string;
    styleImages: Record<string, string>;
    slot_hold_id?: string;
  }) => void;
}

interface BookingModalProps {
  salon: Salon | null;
  artist: Artist | null;
  preselectedServiceId?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingComplete?: () => void;
  bookingData?: BookingDataProps;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/** Local date string YYYY-MM-DD so "today" matches the user's calendar date in any timezone */
function toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const generateDates = () => {
  const dates: { full: string; dayName: string; dayNum: number; iso: string }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      full: d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      iso: toLocalDateString(d),
    });
  }
  return dates;
};

const DATES = generateDates();

/** Parse time string (HH:mm or HH:mm AM/PM) to minutes since midnight */
function parseTimeToMinutes(t: string): number {
  const match = t.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return 0;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (match[3]?.toUpperCase() === 'PM' && h !== 12) h += 12;
  else if (match[3]?.toUpperCase() === 'AM' && h === 12) h = 0;
  return h * 60 + m;
}

/** Filter time slots to only future times when date is today (use local date so timezone is correct) */
function filterFutureTimeSlots(
  slots: Array<{ time: string; label: string }>,
  dateIso: string
): Array<{ time: string; label: string }> {
  const now = new Date();
  const todayIso = toLocalDateString(now);
  if (dateIso !== todayIso) return slots;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return slots.filter((s) => parseTimeToMinutes(s.time || s.label) > currentMinutes);
}

/** Format 24h time (HH:mm) to display (e.g. 09:00 → 09:00 AM, 13:30 → 01:30 PM) */
function formatTimeLabel(h24: string): string {
  const [hStr, mStr] = h24.split(':');
  const h = parseInt(hStr || '0', 10);
  const m = mStr || '00';
  if (h === 0) return `12:${m} AM`;
  if (h < 12) return `${String(h).padStart(2, '0')}:${m} AM`;
  if (h === 12) return `12:${m} PM`;
  return `${String(h - 12).padStart(2, '0')}:${m} PM`;
}

/** Generate 30-min slots from open to close using salon/artist hours. Returns display labels (e.g. 09:00 AM). */
function generateSlotsFromSalonHours(
  salon: Salon | null,
  artist: Artist | null,
  selectedDate: string,
  dateIso: string
): Array<{ time: string; label: string }> {
  let openStr = '09:00';
  let closeStr = '20:00';
  let isOpen = true;

  const dayOfWeek = (() => {
    const d = dateIso.match(/^\d{4}-\d{2}-\d{2}/)
      ? new Date(dateIso + 'T12:00:00')
      : new Date(selectedDate);
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  })();

  const hoursRaw = (salon as { hoursRaw?: any })?.hoursRaw ?? salon;
  if (Array.isArray(hoursRaw)) {
    const dayHours = hoursRaw.find((h: any) =>
      (h.day || '').toLowerCase() === dayOfWeek.toLowerCase()
    );
    if (dayHours) {
      isOpen = !!dayHours.isOpen;
      if (dayHours.open) openStr = String(dayHours.open).padStart(5, '0').slice(0, 5);
      if (dayHours.close) closeStr = String(dayHours.close).padStart(5, '0').slice(0, 5);
    }
  } else if (typeof (salon?.hours) === 'string' && salon.hours !== 'N/A') {
    const parts = salon.hours.split(/-|–|—/).map((s: string) => s.trim());
    if (parts.length >= 2) {
      const parsePart = (p: string) => {
        const m = p.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
        if (!m) return 0;
        let h = parseInt(m[1], 10);
        const mins = m[2] ? parseInt(m[2], 10) : 0;
        if (m[3]?.toUpperCase() === 'PM' && h !== 12) h += 12;
        else if (m[3]?.toUpperCase() === 'AM' && h === 12) h = 0;
        return h * 60 + mins;
      };
      const openM = parsePart(parts[0]);
      const closeM = parsePart(parts[1]);
      if (openM > 0 || closeM > 0) {
        const toStr = (mins: number) =>
          `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
        openStr = toStr(openM);
        closeStr = toStr(closeM);
      }
    }
  } else if (artist?.hours) {
    const parts = artist.hours.split(/-|–|—/).map((s: string) => s.trim());
    if (parts.length >= 2) {
      const parsePart = (p: string) => {
        const m = p.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
        if (!m) return 0;
        let h = parseInt(m[1], 10);
        const mins = m[2] ? parseInt(m[2], 10) : 0;
        if (m[3]?.toUpperCase() === 'PM' && h !== 12) h += 12;
        else if (m[3]?.toUpperCase() === 'AM' && h === 12) h = 0;
        return h * 60 + mins;
      };
      const openM = parsePart(parts[0]);
      const closeM = parsePart(parts[1]);
      if (openM > 0 || closeM > 0) {
        const toStr = (mins: number) =>
          `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
        openStr = toStr(openM);
        closeStr = toStr(closeM);
      }
    }
  }

  if (!isOpen) return [];

  const [oh, om] = openStr.split(':').map(Number);
  const [ch, cm] = closeStr.split(':').map(Number);
  const openMins = (oh || 0) * 60 + (om || 0);
  const closeMins = (ch || 0) * 60 + (cm || 0);

  const slots: Array<{ time: string; label: string }> = [];
  for (let m = openMins; m < closeMins; m += 30) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    const h24 = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    slots.push({ time: h24, label: formatTimeLabel(h24) });
  }
  return slots;
}

/** §2: True if salon/artist is closed on this date (for disabling date picker). */
function isDateClosed(
  salon: Salon | null,
  artist: Artist | null,
  dateIso: string
): boolean {
  const dayOfWeek = dateIso.match(/^\d{4}-\d{2}-\d{2}/)
    ? new Date(dateIso + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' })
    : '';
  const hoursRaw = (salon as { hoursRaw?: any })?.hoursRaw ?? salon;
  if (Array.isArray(hoursRaw)) {
    const dayHours = hoursRaw.find((h: any) =>
      (h.day || '').toLowerCase() === dayOfWeek.toLowerCase()
    );
    if (dayHours) return !dayHours.isOpen;
  }
  return false;
}

function addMinutes(time24: string, minutes: number): string {
  const [h, m] = time24.split(':').map(Number);
  const total = (h || 0) * 60 + (m || 0) + minutes;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

const BookingModal: React.FC<BookingModalProps> = ({ salon, artist, preselectedServiceId, isOpen, onClose, onBookingComplete, bookingData }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isExtraSmall = useMediaQuery('(max-width:400px)');
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [activeStep, setActiveStep] = useState(0);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [serviceStyles, setServiceStyles] = useState<Record<string, string>>({}); 
  const [selectedStaff, setSelectedStaff] = useState<string | 'any'>('any');
  const [selectedDate, setSelectedDate] = useState<string>(DATES[0].full);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitInitiated, setSubmitInitiated] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromotion, setAppliedPromotion] = useState<ValidatedPromo | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [slotHoldId, setSlotHoldId] = useState<string | null>(null);
  const [slotHoldLoading, setSlotHoldLoading] = useState(false);

  // Gallery Sub-State
  const [galleryViewService, setGalleryViewService] = useState<string | null>(null);
  
  // Image Preview (Lightbox) State
  const [previewImage, setPreviewImage] = useState<VisualStyleSuggestion | null>(null);
  const [previewingForServiceId, setPreviewingForServiceId] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity?: 'error' | 'success' }>({ open: false, message: '' });
  
  // Ref to track if movement happened during drag to distinguish from a click
  const didDragRef = useRef(false);

  // Ref for DialogContent to handle scrolling to top
  const contentRef = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentServiceUploadRef = useRef<string | null>(null);

  // Defer heavy data so INP stays low (React renders old value first, then background update)
  const deferredServices = useDeferredValue(bookingData?.services ?? []);
  const deferredStaff = useDeferredValue(bookingData?.staff ?? []);
  const deferredLookbook = useDeferredValue(bookingData?.lookbook ?? []);

  const availableServices = useMemo(() => {
    if (deferredServices?.length) {
      return deferredServices.map(s => ({
        id: s.id,
        name: s.name,
        price: s.price,
        duration: s.duration,
        category: s.category || 'General',
        suggestedImages: (s as { suggestedImages?: string[] }).suggestedImages,
        original_price: (s as { original_price?: number }).original_price,
        promotion_id: (s as { promotion_id?: string }).promotion_id,
      }));
    }
    return salon?.fullServices ?? [];
  }, [salon, deferredServices]);

  const dynamicStaff = useMemo(() => {
    const mapStaff = (s: { id: string; name: string; image?: string; avatar?: string; role?: string }) => ({
      id: s.id,
      name: s.name,
      image: s.image || s.avatar || '',
      role: s.role || 'Stylist',
    });
    if (deferredStaff?.length) {
      let list = deferredStaff.map(mapStaff);
      if (artist && !list.some(s => s.id === artist.id)) {
        list = [mapStaff({ id: artist.id, name: artist.name, image: artist.image, avatar: artist.avatar, role: artist.role }), ...list];
      }
      return list;
    }
    let list = salon?.stylists?.map(s => mapStaff({ id: s.id, name: s.name, image: s.image, role: s.role })) || [];
    if (artist && !list.some(s => s.id === artist.id)) {
      list = [mapStaff({ id: artist.id, name: artist.name, image: artist.image, avatar: artist.avatar, role: artist.role }), ...list];
    }
    return list;
  }, [salon, artist, deferredStaff]);

  const timeSlots = useMemo(() => {
    const dateIso = DATES.find(d => d.full === selectedDate)?.iso ?? selectedDate;
    let slots: Array<{ time: string; label: string }>;
    if (bookingData?.availability?.length && selectedStaff !== 'any') {
      slots = bookingData.availability.map(s => ({ time: s.time, label: s.label || s.time }));
    } else {
      slots = generateSlotsFromSalonHours(salon, artist, selectedDate, dateIso);
    }
    return filterFutureTimeSlots(slots, dateIso);
  }, [bookingData?.availability, selectedStaff, selectedDate, salon, artist]);

  const timeSlotsValid = useMemo(() => {
    if (!selectedTime) return true;
    return timeSlots.some(s => (s.label || s.time) === selectedTime);
  }, [selectedTime, timeSlots]);

  /** §2: Closed days for date picker (disable chips). */
  const closedDateIsos = useMemo(() => {
    const set = new Set<string>();
    DATES.forEach(d => {
      if (isDateClosed(salon, artist, d.iso)) set.add(d.iso);
    });
    return set;
  }, [salon, artist]);

  useEffect(() => {
    if (!timeSlotsValid && selectedTime) setSelectedTime(null);
  }, [timeSlotsValid, selectedTime]);

  const slotHoldIdRef = useRef<string | null>(null);
  slotHoldIdRef.current = slotHoldId;
  /** §12: When staff or date changes, release hold and clear selected time. */
  useEffect(() => {
    const id = slotHoldIdRef.current;
    if (id) {
      releaseSlotHoldApi(id).catch(() => {});
      setSlotHoldId(null);
      setSelectedTime(null);
    }
  }, [selectedStaff, selectedDate]);

  /** §12: Release slot hold when modal closes. */
  useEffect(() => {
    if (!isOpen && slotHoldId) {
      releaseSlotHoldApi(slotHoldId).catch(() => {});
      setSlotHoldId(null);
    }
  }, [isOpen, slotHoldId]);

  const salonLookbook = useMemo(() => {
    if (deferredLookbook?.length) {
      return deferredLookbook.map(l => ({
        id: l.id,
        image: getFullImageUrl(l.image) || l.image,
        name: l.name || 'Sanctuary Masterpiece',
        category: l.category || 'Any',
        vibe: l.vibe || 'Signature Look'
      }));
    }
    return [];
  }, [deferredLookbook]);

  // Effect to reset scroll position when changing steps or entering/exiting gallery view
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeStep, galleryViewService, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setActiveStep(0);
      setSelectedServices(preselectedServiceId ? [preselectedServiceId] : []);
      setServiceStyles({});
      setSelectedTime(null);
      setSlotHoldId(null);
      setIsSuccess(false);
      setSelectedStaff('any');
      setGalleryViewService(null);
      setPreviewImage(null);
      const firstOfferCode = salon?.offers?.find((o: { code?: string | null }) => o?.code)?.code ?? null;
      setPromoCode(firstOfferCode || '');
      setAppliedPromotion(null);
      setPromoError(null);
      if (artist) setSelectedStaff(artist.id);
    }
  }, [isOpen, artist, preselectedServiceId, salon]);

  useEffect(() => {
    if (bookingData?.loadAvailability && selectedStaff !== 'any' && selectedDate) {
      const iso = DATES.find(d => d.full === selectedDate)?.iso ?? (selectedDate.includes('-') ? selectedDate : new Date(selectedDate).toISOString().slice(0, 10));
      const totalDuration = selectedServices
        .map(id => bookingData?.services?.find(s => s.id === id)?.duration)
        .filter((d): d is number => typeof d === 'number')
        .reduce((sum, d) => sum + d, 0);
      const durationMinutes = totalDuration > 0 ? totalDuration : 30;
      const serviceId = selectedServices.length > 0 ? selectedServices[0] : undefined;
      bookingData.loadAvailability(selectedStaff, iso, { durationMinutes, bufferMinutes: 0, serviceId });
    }
  }, [bookingData?.loadAvailability, bookingData?.services, selectedStaff, selectedDate, selectedServices]);

  useEffect(() => {
    if (submitInitiated && bookingData && !bookingData.submitLoading) {
      setSubmitInitiated(false);
      if (bookingData.submitError) {
        // Error is shown via bookingData.submitError in UI
      } else {
        setIsSuccess(true);
        onBookingComplete?.();
        setTimeout(onClose, 2000);
      }
    }
  }, [submitInitiated, bookingData?.submitLoading, bookingData?.submitError, onBookingComplete, onClose]);

  // Reset pan and zoom when lightbox closes or image changes
  useEffect(() => {
    setIsZoomed(false);
    setPanPosition({ x: 0, y: 0 });
    didDragRef.current = false;
  }, [previewImage]);

  const handleToggleService = (id: string) => {
    setSelectedServices(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSetServiceStyle = (serviceId: string, image: string) => {
    setServiceStyles(prev => ({ ...prev, [serviceId]: image }));
    setPreviewImage(null); 
  };

  const handleRemoveServiceStyle = (serviceId: string) => {
    const next = { ...serviceStyles };
    delete next[serviceId];
    setServiceStyles(next);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const serviceId = currentServiceUploadRef.current;
    if (!file || !serviceId) return;
    e.target.value = '';

    setIsProcessingImage(serviceId);
    try {
      const optimized = await optimizeImage(file, { maxWidth: 1600, quality: 0.85 });
      handleSetServiceStyle(serviceId, optimized);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Image optimization failed';
      setSnackbar({ open: true, message: msg });
    } finally {
      setIsProcessingImage(null);
    }
  };

  const triggerUpload = (serviceId: string) => {
    currentServiceUploadRef.current = serviceId;
    fileInputRef.current?.click();
  };

  const baseTotal = useMemo(() => {
    return selectedServices.reduce((sum, id) => sum + (availableServices.find(s => s.id === id)?.price || 0), 0);
  }, [selectedServices, availableServices]);

  const totalPrice = useMemo(() => {
    if (!appliedPromotion || baseTotal <= 0) return baseTotal;
    let discount = 0;
    if (appliedPromotion.discount_percent != null) {
      discount = (baseTotal * appliedPromotion.discount_percent) / 100;
    } else if (appliedPromotion.discount_value != null) {
      discount = Math.min(appliedPromotion.discount_value, baseTotal);
    } else if (appliedPromotion.bundle_price != null) {
      discount = Math.max(0, baseTotal - appliedPromotion.bundle_price);
    }
    return Math.max(0, baseTotal - discount);
  }, [selectedServices, availableServices, baseTotal, appliedPromotion]);

  const promoBadgeLabel = useMemo(() => {
    if (!appliedPromotion) return null;
    if (appliedPromotion.discount_percent != null) return `${appliedPromotion.discount_percent}% OFF`;
    if (appliedPromotion.discount_value != null) return `Rs.${appliedPromotion.discount_value.toLocaleString()} OFF`;
    if (appliedPromotion.bundle_price != null) return 'Bundle applied';
    return appliedPromotion.title || 'Promo applied';
  }, [appliedPromotion]);

  const handleApplyPromo = useCallback(async () => {
    const code = promoCode.trim();
    if (!code) return;
    const salonId = salon?.id || artist?.salonId;
    if (!salonId) {
      setPromoError('Select a salon first');
      return;
    }
    setIsApplyingPromo(true);
    setPromoError(null);
    try {
      const dateIso = DATES.find(d => d.full === selectedDate)?.iso ?? selectedDate;
      const servicesList = selectedServices
        .map(id => availableServices.find(s => s.id === id))
        .filter(Boolean) as Array<{ id: string; price: number; category?: string }>;
      const baseTotalVal = servicesList.reduce((sum, s) => sum + (s?.price ?? 0), 0);
      const serviceCategories = [...new Set(servicesList.map(s => s?.category || 'General').filter(Boolean))];
      const timeStr = selectedTime ? String(selectedTime).replace(/\s*AM|PM/i, '').trim() : undefined;
      const res: any = await validatePromoCodeApi(salonId, code, {
        serviceIds: selectedServices,
        bookingDate: dateIso,
        startTime: timeStr,
        bookingTotal: baseTotalVal,
        serviceCategories,
      });
      const data: ValidatedPromo | undefined = res?.data?.data ?? res?.data;
      if (data) {
        setAppliedPromotion(data);
        setSnackbar({ open: true, message: 'Promotion applied successfully!', severity: 'success' });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.errorMessage || err?.message || 'Invalid promo code';
      setPromoError(msg);
      setAppliedPromotion(null);
    } finally {
      setIsApplyingPromo(false);
    }
  }, [promoCode, salon?.id, artist?.salonId, selectedServices, selectedDate, selectedTime, availableServices]);

  const handleRemovePromo = useCallback(() => {
    setAppliedPromotion(null);
    setPromoCode('');
    setPromoError(null);
  }, []);

  /** §12: On time slot click — create slot hold when staff is specific, else just set time. */
  const handleSelectTime = useCallback(
    (slot: { time: string; label: string }) => {
      const dateIso = DATES.find(d => d.full === selectedDate)?.iso ?? selectedDate;
      const totalDuration =
        selectedServices
          .map(id => bookingData?.services?.find(s => s.id === id)?.duration)
          .filter((d): d is number => typeof d === 'number')
          .reduce((sum, d) => sum + d, 0) || 30;
      const salonId = salon?.id || artist?.salonId;

      if (selectedStaff === 'any' || !salonId) {
        setSelectedTime(slot.label);
        return;
      }

      setSlotHoldLoading(true);
      if (slotHoldId) {
        releaseSlotHoldApi(slotHoldId).catch(() => {});
        setSlotHoldId(null);
      }
      createSlotHoldApi({
        salon_id: salonId,
        staff_id: selectedStaff,
        booking_date: dateIso,
        start_time: slot.time,
        end_time: addMinutes(slot.time, totalDuration),
      })
        .then((res: any) => {
          const id = res?.data?.data?.id ?? res?.data?.id;
          if (id) {
            setSlotHoldId(id);
            setSelectedTime(slot.label);
          } else {
            setSelectedTime(slot.label);
          }
        })
        .catch((err: any) => {
          const is409 = err?.response?.status === 409;
          setSnackbar({
            open: true,
            message: is409 ? 'This slot is no longer available.' : err?.message || 'Could not reserve slot',
            severity: 'error',
          });
        })
        .finally(() => setSlotHoldLoading(false));
    },
    [selectedDate, selectedServices, selectedStaff, salon?.id, artist?.salonId, bookingData?.services, slotHoldId]
  );

  const handleNext = () => {
    if (activeStep < 4) setActiveStep(prev => prev + 1);
    else if (bookingData?.submitBooking && (salon?.id || artist?.salonId)) {
      const effectiveSalonId = salon?.id || artist?.salonId!;
      const services = selectedServices
        .map(id => availableServices.find(s => s.id === id))
        .filter(Boolean) as Array<{ id: string; name: string; price: number; duration: number; category?: string; original_price?: number; promotion_id?: string }>;
      const dateIso = DATES.find(d => d.full === selectedDate)?.iso ?? selectedDate;
      const promoId = appliedPromotion?.id;
      const servicesPayload = services.map(s => {
        const origPrice = s.original_price ?? s.price;
        let finalPrice = s.price;
        if (promoId && baseTotal > 0) {
          finalPrice = Math.round((s.price / baseTotal) * totalPrice);
        }
        return {
          id: s.id,
          price: finalPrice,
          duration: typeof s.duration === 'number' ? s.duration : parseInt(String(s.duration), 10) || 60,
          ...(origPrice !== finalPrice && { original_price: origPrice }),
          ...(promoId && { promotion_id: promoId }),
        };
      });
      bookingData.submitBooking({
        salonId: effectiveSalonId,
        serviceIds: selectedServices,
        services: servicesPayload,
        staffId: selectedStaff === 'any' ? undefined : selectedStaff,
        selectedDate: dateIso,
        selectedTime: selectedTime!,
        styleImages: serviceStyles,
        ...(slotHoldId && { slot_hold_id: slotHoldId }),
      });
      setSubmitInitiated(true);
    } else {
      const staffName = selectedStaff === 'any' ? 'Any Available Artisan' : dynamicStaff.find(s => s.id === selectedStaff)?.name || 'Unknown';
      const newAppointment: Appointment = {
        id: Math.random().toString(36).substring(2, 11),
        salonId: salon?.id || artist?.salonId || 'ind',
        salonName: salon?.name || artist?.salonName || 'Independent',
        salonImage: salon?.image || '',
        serviceNames: selectedServices.map(id => availableServices.find(s => s.id === id)?.name || ''),
        staffName,
        date: selectedDate,
        time: selectedTime!,
        totalPrice,
        timestamp: Date.now(),
        status: 'upcoming',
        images: Object.values(serviceStyles)
      };
      const existing = JSON.parse(localStorage.getItem('luxe_bookings') || '[]');
      localStorage.setItem('luxe_bookings', JSON.stringify([newAppointment, ...existing]));
      setIsSuccess(true);
      setTimeout(onClose, 2000);
    }
  };

  // Lightbox Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isZoomed) return;
    setIsDragging(true);
    didDragRef.current = false;
    setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isZoomed) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Distinguish drag from click with a small threshold
    if (Math.abs(newX - panPosition.x) > 2 || Math.abs(newY - panPosition.y) > 2) {
      didDragRef.current = true;
    }

    setPanPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isZoomed) return;
    setIsDragging(true);
    didDragRef.current = false;
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX - panPosition.x, y: touch.clientY - panPosition.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isZoomed) return;
    const touch = e.touches[0];
    
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;
    
    if (Math.abs(newX - panPosition.x) > 2 || Math.abs(newY - panPosition.y) > 2) {
      didDragRef.current = true;
    }

    setPanPosition({ x: newX, y: newY });
  };

  function getServiceSuggestions(serviceId: string): VisualStyleSuggestion[] {
    const s = availableServices.find(x => x.id === serviceId);
    const suggestedImages = (s as { suggestedImages?: string[] })?.suggestedImages ?? [];
    const fromService = suggestedImages
      .map((url, idx) => ({ id: `sug-${serviceId}-${idx}`, name: s?.name ?? 'Style', category: s?.category ?? 'Any', image: getFullImageUrl(url) || url }))
      .filter(v => v.image);
    return [...salonLookbook, ...fromService];
  }

  const InspirationGrid = ({ serviceId }: { serviceId: string }) => {
    const s = availableServices.find(x => x.id === serviceId);
    const currentImg = serviceStyles[serviceId];
    const suggestions = getServiceSuggestions(serviceId);

    const isCustomUploadSelected = currentImg && !suggestions.some(sugg => sugg.image === currentImg);

    return (
      <Fade in timeout={400}>
        <Box sx={{ pb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <IconButton onClick={() => setGalleryViewService(null)} size="small">
              <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
            </IconButton>
            <Box>
              <Typography variant="overline" sx={{ fontWeight: 900, color: 'secondary.main', display: 'block', lineHeight: 1 }}>LOOKBOOK GALLERY</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>{s?.name}</Typography>
            </Box>
          </Stack>

          <Grid2 container spacing={1}>
            <Grid2 size={{ xs: 4, sm: 3 }}>
              <Paper 
                elevation={0}
                onClick={() => triggerUpload(serviceId)}
                sx={{ 
                  aspectRatio: '3/4', borderRadius: '16px', border: '1.5px dashed', borderColor: 'divider',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', bgcolor: 'action.hover', '&:hover': { borderColor: 'secondary.main' }
                }}
              >
                {isProcessingImage === serviceId ? <CircularProgress size={20} color="secondary" /> : <><Camera size={24} color={theme.palette.secondary.main} /><Typography sx={{ fontSize: '9px', fontWeight: 900, mt: 1 }}>UPLOAD</Typography></>}
              </Paper>
            </Grid2>

            {/* Render Custom Uploaded Image if it exists and is selected */}
            {isCustomUploadSelected && (
              <Grid2 size={{ xs: 4, sm: 3 }}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    aspectRatio: '3/4', borderRadius: '16px', overflow: 'hidden', 
                    border: '2.5px solid', borderColor: 'secondary.main', 
                    position: 'relative'
                  }}
                >
                  <Box component="img" src={currentImg} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(212, 175, 55, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{ p: 0.5, bgcolor: 'secondary.main', borderRadius: '50%' }}><Check size={18} color="#fff" strokeWidth={4} /></Box>
                  </Box>
                  <Typography variant="caption" sx={{ position: 'absolute', bottom: 4, left: 0, right: 0, textAlign: 'center', fontWeight: 900, fontSize: '7px', color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.5)', letterSpacing: 1 }}>YOUR REFERENCE</Typography>
                </Paper>
              </Grid2>
            )}

            {suggestions.map((suggestion, idx) => {
              const isSelected = currentImg === suggestion.image;
              return (
                <Grid2 size={{ xs: 4, sm: 3 }} key={`${suggestion.id}-${idx}`}>
                  <Paper 
                    elevation={0} 
                    onClick={() => handleSetServiceStyle(serviceId, suggestion.image)}
                    sx={{ 
                      aspectRatio: '3/4', borderRadius: '16px', overflow: 'hidden', 
                      border: '2.5px solid', borderColor: isSelected ? 'secondary.main' : 'transparent', 
                      transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)', cursor: 'pointer', position: 'relative',
                      '&:hover': { transform: isSelected ? 'none' : 'scale(1.02)' }
                    }}
                  >
                    <Box component="img" src={suggestion.image} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    
                    <IconButton 
                      size="small" 
                      onClick={(e) => { e.stopPropagation(); setPreviewImage(suggestion); setPreviewingForServiceId(serviceId); }}
                      sx={{ position: 'absolute', top: 6, right: 6, bgcolor: 'rgba(0,0,0,0.4)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' }, p: 0.5 }}
                    >
                      <Maximize2 size={12} />
                    </IconButton>

                    {isSelected && (
                      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(212, 175, 55, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Box sx={{ p: 0.5, bgcolor: 'secondary.main', borderRadius: '50%' }}><Check size={18} color="#fff" strokeWidth={4} /></Box>
                      </Box>
                    )}
                  </Paper>
                </Grid2>
              );
            })}
          </Grid2>
        </Box>
      </Fade>
    );
  };

  const steps = ['Services', 'Archive', 'Artisan', 'Time', 'Review'];

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      fullScreen={fullScreen} 
      maxWidth="sm" 
      fullWidth 
      TransitionComponent={Transition} 
      slotProps={{ 
        paper: { 
          sx: { 
            borderRadius: fullScreen ? 0 : '40px', 
            bgcolor: 'background.paper', 
            backgroundImage: 'none', 
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          } 
        } 
      }}
    >
      <DialogTitle sx={{ p: { xs: 2, sm: 4 }, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, bgcolor: 'background.paper' }}>
        <Typography component="span" variant="h6" sx={{ fontWeight: 900, letterSpacing: '-0.02em', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
          {isSuccess ? '' : `Plan Your Ritual`}
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ bgcolor: 'action.hover' }}><X size={20} /></IconButton>
      </DialogTitle>

      <DialogContent ref={contentRef} sx={{ px: { xs: 2, sm: 4 }, pb: { xs: 12, sm: 10 }, flex: 1, position: 'relative' }}>
        {isSuccess ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Box sx={{ width: 100, height: 100, bgcolor: 'rgba(34, 197, 94, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 4 }}><Sparkles size={48} color="#22c55e" /></Box>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1.5 }}>Ritual Confirmed</Typography>
            <Typography sx={{ color: 'text.secondary', fontWeight: 600, maxWidth: 300, mx: 'auto', lineHeight: 1.6 }}>We have reserved your sanctuary time for {selectedDate}.</Typography>
          </Box>
        ) : galleryViewService ? (
          <InspirationGrid serviceId={galleryViewService} />
        ) : (
          <>
            <Stepper 
              activeStep={activeStep} 
              alternativeLabel={!isExtraSmall} 
              sx={{ 
                mb: { xs: 3, sm: 5 }, 
                '& .MuiStepLabel-label': { 
                  fontWeight: 900, 
                  fontSize: { xs: '8px', sm: '10px' }, 
                  color: 'text.secondary', 
                  letterSpacing: '0.05em',
                  display: isExtraSmall ? 'none' : 'block'
                },
                '& .MuiStepIcon-root': {
                   fontSize: { xs: '1.2rem', sm: '1.5rem' }
                }
              }}
            >
              {steps.map((label) => (
                <Step key={label}><StepLabel>{label.toUpperCase()}</StepLabel></Step>
              ))}
            </Stepper>

            {bookingData?.bookingRules && (bookingData.bookingRules.min_notice_minutes != null || bookingData.bookingRules.max_advance_days != null || bookingData.bookingRules.advance_payment_rule === 'MUST') && (
              <Box sx={{ py: 1, px: 0 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                  <Info size={12} />
                  {bookingData.bookingRules.min_notice_minutes != null && bookingData.bookingRules.min_notice_minutes > 0 && (
                    <>Book at least {bookingData.bookingRules.min_notice_minutes >= 60 ? `${bookingData.bookingRules.min_notice_minutes / 60} hour(s)` : `${bookingData.bookingRules.min_notice_minutes} min`} before</>
                  )}
                  {bookingData.bookingRules.min_notice_minutes != null && bookingData.bookingRules.max_advance_days != null && ' • '}
                  {bookingData.bookingRules.max_advance_days != null && bookingData.bookingRules.max_advance_days > 0 && (
                    <>Up to {bookingData.bookingRules.max_advance_days} days ahead</>
                  )}
                  {bookingData.bookingRules.advance_payment_rule === 'MUST' && (bookingData.bookingRules.min_notice_minutes != null || bookingData.bookingRules.max_advance_days != null) && ' • '}
                  {bookingData.bookingRules.advance_payment_rule === 'MUST' && <>Advance payment required</>}
                </Typography>
              </Box>
            )}

            <Box sx={{ minHeight: { xs: 'auto', sm: 450 } }}>
              {bookingData?.error && (
                <Typography color="error" sx={{ mb: 2, fontSize: '13px' }}>{bookingData.error}</Typography>
              )}
              {bookingData?.submitError && (
                <Typography color="error" sx={{ mb: 2, fontSize: '13px' }}>{bookingData.submitError}</Typography>
              )}
              {activeStep === 0 && bookingData?.loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                  <CircularProgress />
                </Box>
              ) : activeStep === 0 && (
                <Stack spacing={2}>
                  <Typography variant="overline" sx={{ fontWeight: 900, color: 'text.secondary', letterSpacing: 2, fontSize: '11px' }}>SELECT TREATMENTS</Typography>
                  {availableServices.map((s) => {
                    const isSelected = selectedServices.includes(s.id);
                    return (
                      <Paper key={s.id} component="button" onClick={() => handleToggleService(s.id)} elevation={0} sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '24px', border: '2px solid', borderColor: isSelected ? 'secondary.main' : theme.palette.divider, bgcolor: isSelected ? 'rgba(212, 175, 55, 0.04)' : 'background.paper', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)', width: '100%', textAlign: 'left', color: 'text.primary', '&:active': { transform: 'scale(0.98)' } }}>
                        <Box>
                          <Typography sx={{ fontWeight: 800, fontSize: '15px' }}>{s.name}</Typography>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                            <Clock size={12} color={theme.palette.text.secondary} />
                            <Typography sx={{ fontSize: '11px', color: 'text.secondary', fontWeight: 700 }}>{typeof s.duration === 'number' ? `${s.duration} MINS` : s.duration} • {(s.category || 'General').toUpperCase()}</Typography>
                          </Stack>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography sx={{ fontWeight: 900, fontSize: '16px' }}>{formatLKR(s.price)}</Typography>
                          {isSelected && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'secondary.main', mt: 0.5 }}><Check size={14} strokeWidth={3} /><Typography sx={{ fontSize: '9px', fontWeight: 900 }}>SELECTED</Typography></Box>}
                        </Box>
                      </Paper>
                    );
                  })}
                </Stack>
              )}

              {activeStep === 1 && (
                <Stack spacing={4}>
                  <Box>
                    <Typography variant="overline" sx={{ fontWeight: 900, color: 'text.secondary', letterSpacing: 2, fontSize: '11px' }}>AESTHETIC ARCHIVE</Typography>
                    <Typography variant="body2" sx={{ fontSize: '13px', color: 'text.secondary', mt: 1, fontWeight: 500 }}>
                      Select visual intent or upload a custom reference.
                    </Typography>
                  </Box>

                  {selectedServices.map(serviceId => {
                    const s = availableServices.find(x => x.id === serviceId);
                    const currentImg = serviceStyles[serviceId];
                    const suggestions = getServiceSuggestions(serviceId).slice(0, 8);

                    const isCustomUploadSelected = currentImg && !suggestions.some(sugg => sugg.image === currentImg);

                    return (
                      <Box key={serviceId}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                          <Typography sx={{ fontWeight: 900, fontSize: '11px', color: 'text.primary', letterSpacing: '0.05em' }}>{s?.name.toUpperCase()}</Typography>
                          <Button 
                            size="small" 
                            onClick={() => setGalleryViewService(serviceId)}
                            endIcon={<LayoutGrid size={12} />}
                            sx={{ fontSize: '10px', fontWeight: 900, color: 'secondary.main' }}
                          >
                            VIEW ALL
                          </Button>
                        </Stack>

                        <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1, px: 0.5, '&::-webkit-scrollbar': { display: 'none' } }}>
                          <Paper 
                            elevation={0} 
                            onClick={() => triggerUpload(serviceId)}
                            sx={{ 
                              minWidth: 100, height: 140, borderRadius: '16px', border: '1.5px dashed', 
                              borderColor: isProcessingImage === serviceId ? 'secondary.main' : 'divider', 
                              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                              cursor: 'pointer', flexShrink: 0, bgcolor: 'action.hover'
                            }}
                          >
                            {isProcessingImage === serviceId ? <CircularProgress size={20} color="secondary" /> : <><Camera size={20} color={theme.palette.secondary.main} /><Typography sx={{ fontSize: '9px', fontWeight: 900, mt: 1 }}>UPLOAD</Typography></>}
                          </Paper>

                          {isCustomUploadSelected && (
                            <Paper 
                              elevation={0}
                              sx={{ 
                                minWidth: 100, height: 140, borderRadius: '16px', overflow: 'hidden', 
                                border: '2px solid', borderColor: 'secondary.main', 
                                position: 'relative', flexShrink: 0
                              }}
                            >
                              <Box component="img" src={currentImg} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(212, 175, 55, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Box sx={{ p: 0.5, bgcolor: 'secondary.main', borderRadius: '50%' }}><Check size={18} color="#fff" strokeWidth={3} /></Box>
                              </Box>
                            </Paper>
                          )}

                          {suggestions.map((suggestion, idx) => {
                            const isSelected = currentImg === suggestion.image;
                            return (
                              <Paper 
                                key={`${suggestion.id}-${idx}`}
                                elevation={0} 
                                onClick={() => handleSetServiceStyle(serviceId, suggestion.image)}
                                sx={{ 
                                  minWidth: 100, height: 140, borderRadius: '16px', overflow: 'hidden', 
                                  border: '2px solid', borderColor: isSelected ? 'secondary.main' : 'transparent', 
                                  transition: 'all 0.3s ease', cursor: 'pointer', position: 'relative', flexShrink: 0
                                }}
                              >
                                <Box component="img" src={suggestion.image} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                {isSelected && (
                                  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(212, 175, 55, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Box sx={{ p: 0.5, bgcolor: 'secondary.main', borderRadius: '50%' }}><Check size={18} color="#fff" strokeWidth={3} /></Box>
                                  </Box>
                                )}
                              </Paper>
                            );
                          })}
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              )}

              {activeStep === 2 && (
                <Stack spacing={2}>
                  <Typography variant="overline" sx={{ fontWeight: 900, color: 'text.secondary', letterSpacing: 2, fontSize: '11px' }}>SELECT ARTISAN</Typography>
                  <Paper component="button" onClick={() => setSelectedStaff('any')} elevation={0} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: '100px', border: '2px solid', borderColor: selectedStaff === 'any' ? 'secondary.main' : theme.palette.divider, bgcolor: selectedStaff === 'any' ? 'rgba(212, 175, 55, 0.04)' : 'background.paper', cursor: 'pointer', width: '100%' }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}><Users size={20} color="#fff" /></Avatar>
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '14px' }}>Any Available Artisan</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>Fastest booking possible</Typography>
                    </Box>
                    {selectedStaff === 'any' && <Box sx={{ ml: 'auto', color: 'secondary.main' }}><Check size={20} strokeWidth={3} /></Box>}
                  </Paper>
                  <Divider sx={{ my: 1 }}><Typography variant="caption" sx={{ fontWeight: 900, opacity: 0.5, letterSpacing: 2 }}>OR REQUEST SPECIFIC</Typography></Divider>
                  {dynamicStaff.map((staff) => (
                    <Paper key={staff.id} component="button" onClick={() => setSelectedStaff(staff.id)} elevation={0} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: '100px', border: '2px solid', borderColor: selectedStaff === staff.id ? 'secondary.main' : theme.palette.divider, bgcolor: selectedStaff === staff.id ? 'rgba(212, 175, 55, 0.04)' : 'background.paper', cursor: 'pointer', width: '100%' }}>
                      <AvatarWithFallback src={staff.image} alt={staff.name} placeholderType="staff" sx={{ width: 40, height: 40, border: `2px solid ${theme.palette.background.paper}` }} />
                      <Box sx={{ textAlign: 'left' }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '14px' }}>{staff.name}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>{staff.role || 'Senior Artisan'}</Typography>
                      </Box>
                      {selectedStaff === staff.id && <Box sx={{ ml: 'auto', color: 'secondary.main' }}><Check size={20} strokeWidth={3} /></Box>}
                    </Paper>
                  ))}
                </Stack>
              )}

              {activeStep === 3 && (
                <Stack spacing={4}>
                   <Box>
                    <Typography variant="overline" sx={{ fontWeight: 900, color: 'text.secondary', letterSpacing: 2, mb: 1.5, display: 'block', fontSize: '11px' }}>SELECT DATE</Typography>
                    <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1, px: 0.5, '&::-webkit-scrollbar': { display: 'none' } }}>
                      {DATES.map((date) => {
                        const closed = closedDateIsos.has(date.iso);
                        return (
                        <Paper key={date.full} component="button" type="button" onClick={() => !closed && setSelectedDate(date.full)} disabled={closed} elevation={0} sx={{ minWidth: 64, height: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '20px', border: '2px solid', borderColor: selectedDate === date.full ? 'secondary.main' : theme.palette.divider, bgcolor: selectedDate === date.full ? 'secondary.main' : closed ? 'action.hover' : 'background.paper', color: selectedDate === date.full ? 'primary.main' : closed ? 'text.disabled' : 'text.primary', cursor: closed ? 'not-allowed' : 'pointer', flexShrink: 0, opacity: closed ? 0.7 : 1 }}>
                          <Typography sx={{ fontSize: '9px', fontWeight: 900, opacity: 0.8 }}>{date.dayName.toUpperCase()}</Typography>
                          <Typography sx={{ fontSize: '18px', fontWeight: 900 }}>{date.dayNum}</Typography>
                        </Paper>
                      );})}
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="overline" sx={{ fontWeight: 900, color: 'text.secondary', letterSpacing: 2, mb: 1.5, display: 'block', fontSize: '11px' }}>SELECT TIME</Typography>
                    <Grid2 container spacing={1}>
                      {timeSlots.map((slot) => {
                        const displayTime = slot.label || slot.time;
                        return (
                        <Grid2 size={{ xs: 6 }} key={slot.time}>
                          <Button variant="outlined" fullWidth onClick={() => handleSelectTime(slot)} disabled={slotHoldLoading} sx={{ borderRadius: '12px', py: 1.5, fontWeight: 900, fontSize: '13px', borderColor: selectedTime === displayTime ? 'secondary.main' : 'divider', color: selectedTime === displayTime ? 'secondary.main' : 'text.primary', bgcolor: selectedTime === displayTime ? 'rgba(212, 175, 55, 0.04)' : 'transparent' }}>{displayTime}</Button>
                        </Grid2>
                      );})}
                    </Grid2>
                  </Box>
                </Stack>
              )}

              {activeStep === 4 && (
                <Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="overline" sx={{ fontWeight: 900, color: 'text.secondary', letterSpacing: 2, fontSize: '11px', mb: 1.5, display: 'block' }}>PROMOTION CODE</Typography>
                    <Stack direction="row" spacing={1.5}>
                      <TextField
                        fullWidth
                        placeholder="Enter code (e.g. LUXE20)"
                        size="small"
                        value={promoCode}
                        onChange={(e) => { setPromoCode(e.target.value); setPromoError(null); }}
                        disabled={!!appliedPromotion}
                        error={!!promoError}
                        helperText={promoError}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: 'background.paper' } }}
                      />
                      {appliedPromotion ? (
                        <Button variant="outlined" onClick={handleRemovePromo} sx={{ borderRadius: '12px', px: 2, fontWeight: 800, fontSize: '11px' }}>
                          REMOVE
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          onClick={handleApplyPromo}
                          disabled={!promoCode.trim() || isApplyingPromo}
                          sx={{ borderRadius: '12px', bgcolor: 'text.primary', color: 'background.paper', px: 3, fontWeight: 800, fontSize: '11px' }}
                        >
                          {isApplyingPromo ? '...' : 'APPLY'}
                        </Button>
                      )}
                    </Stack>
                    {appliedPromotion && promoBadgeLabel && (
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.5, color: 'secondary.main' }}>
                        <Tag size={14} strokeWidth={3} />
                        <Typography sx={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.05em' }}>{promoBadgeLabel}</Typography>
                      </Stack>
                    )}
                  </Box>

                  <Typography variant="overline" sx={{ fontWeight: 900, color: 'text.secondary', letterSpacing: 2, fontSize: '11px' }}>RITUAL SUMMARY</Typography>
                  <Paper elevation={0} sx={{ mt: 2, p: { xs: 2.5, sm: 4 }, borderRadius: '24px', bgcolor: 'action.hover', border: `1.5px solid ${theme.palette.divider}` }}>
                    <Stack spacing={2.5}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                         <Typography sx={{ color: 'text.secondary', fontSize: '12px', fontWeight: 700 }}>Sanctuary</Typography>
                         <Typography sx={{ fontWeight: 900, fontSize: '12px' }}>{salon?.name || artist?.salonName || artist?.location || 'Independent'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                         <Typography sx={{ color: 'text.secondary', fontSize: '12px', fontWeight: 700 }}>Artisan</Typography>
                         <Typography sx={{ fontWeight: 900, fontSize: '12px' }}>{selectedStaff === 'any' ? 'Any Available' : dynamicStaff.find(s => s.id === selectedStaff)?.name}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                         <Typography sx={{ color: 'text.secondary', fontSize: '12px', fontWeight: 700 }}>Schedule</Typography>
                         <Typography sx={{ fontWeight: 900, fontSize: '12px' }}>{selectedDate}, {selectedTime}</Typography>
                      </Box>
                      <Divider />
                      {selectedServices.map(id => {
                        const s = availableServices.find(x => x.id === id);
                        return (
                          <Box key={id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              {serviceStyles[id] ? (
                                <AvatarWithFallback variant="rounded" src={serviceStyles[id]} alt={s?.name ?? 'Service'} placeholderType="avatar" sx={{ width: 36, height: 36, borderRadius: '8px' }} />
                              ) : (
                                <Box sx={{ width: 36, height: 36, borderRadius: '8px', bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${theme.palette.divider}` }}>
                                  <ImageIcon size={14} color={theme.palette.text.disabled} />
                                </Box>
                              )}
                              <Typography sx={{ fontSize: '13px', fontWeight: 800 }}>{s?.name}</Typography>
                            </Stack>
                            <Typography sx={{ fontSize: '13px', fontWeight: 900 }}>{formatLKR(s?.price ?? 0)}</Typography>
                          </Box>
                        );
                      })}
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <Typography sx={{ fontWeight: 900, fontSize: '1rem' }}>Total</Typography>
                         <Stack alignItems="flex-end">
                           {appliedPromotion && baseTotal > totalPrice && (
                             <Typography sx={{ fontSize: '12px', color: 'text.secondary', textDecoration: 'line-through', fontWeight: 700 }}>{formatLKR(baseTotal)}</Typography>
                           )}
                           <Typography sx={{ fontWeight: 900, fontSize: '1.25rem', color: 'secondary.main' }}>{formatLKR(totalPrice)}</Typography>
                         </Stack>
                      </Box>
                    </Stack>
                  </Paper>
                </Box>
              )}
            </Box>
          </>
        )}
        
        {/* Hidden File Input */}
        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileUpload} />
      </DialogContent>

      {!isSuccess && !galleryViewService && (
        <DialogActions 
          sx={{ 
            p: { xs: 2, sm: 4 }, 
            borderTop: `1px solid ${theme.palette.divider}`, 
            gap: 1.5,
            position: isMobile ? 'fixed' : 'relative',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: 'background.paper',
            zIndex: 20,
            boxShadow: isMobile ? '0 -10px 30px rgba(0,0,0,0.05)' : 'none'
          }}
        >
          {activeStep > 0 && (
            <Button 
              onClick={() => setActiveStep(prev => prev - 1)} 
              sx={{ color: 'text.secondary', fontWeight: 900, minWidth: 80 }}
            >
              BACK
            </Button>
          )}
          <Button 
            onClick={handleNext} 
            variant="contained" 
            fullWidth 
            disabled={
              (activeStep === 0 && selectedServices.length === 0) || 
              (activeStep === 3 && !selectedTime) || 
              (bookingData?.submitLoading ?? false)
            } 
            sx={{ 
              borderRadius: '100px', 
              bgcolor: 'text.primary', 
              color: 'background.paper', 
              px: 4, 
              py: { xs: 1.8, sm: 2 }, 
              fontWeight: 900, 
              fontSize: '14px', 
              letterSpacing: '0.1em' 
            }}
          >
            {bookingData?.submitLoading ? (
              <>
                <CircularProgress size={20} sx={{ color: 'inherit', mr: 1 }} />
                BOOKING...
              </>
            ) : (
              activeStep === 4 ? 'CONFIRM RITUAL' : 'CONTINUE'
            )}
          </Button>
        </DialogActions>
      )}

      {/* Lightbox / mobile image view: fullscreen on mobile, image-first layout */}
      <Dialog
        open={Boolean(previewImage)}
        onClose={() => setPreviewImage(null)}
        fullScreen={isMobile}
        maxWidth={isMobile ? false : 'md'}
        fullWidth={!isMobile}
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : '32px',
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            overflow: 'hidden',
            ...(isMobile ? { display: 'flex', flexDirection: 'column', maxHeight: '100%' } : { maxHeight: '90vh' }),
          },
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          <Stack direction="column" sx={{ flex: 1, minHeight: 0 }}>
            {/* Image area: fills space on mobile, fixed aspect on desktop */}
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                flex: isMobile ? 1 : undefined,
                minHeight: isMobile ? 0 : undefined,
                aspectRatio: isMobile ? undefined : '4/5',
                overflow: 'hidden',
                bgcolor: '#000',
                cursor: isZoomed ? 'grab' : 'zoom-in',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                touchAction: 'none',
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
            >
              <Stack
                direction="row"
                spacing={1}
                sx={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}
              >
                <IconButton
                  onClick={(e) => { e.stopPropagation(); setIsZoomed(!isZoomed); setPanPosition({ x: 0, y: 0 }); }}
                  sx={{ bgcolor: 'rgba(0,0,0,0.5)', color: '#fff' }}
                >
                  {isZoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
                </IconButton>
                <IconButton
                  onClick={(e) => { e.stopPropagation(); setPreviewImage(null); }}
                  sx={{ bgcolor: 'rgba(0,0,0,0.5)', color: '#fff' }}
                >
                  <X size={20} />
                </IconButton>
              </Stack>
              <Box
                component="img"
                src={previewImage?.image}
                alt={previewImage?.name}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                  transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${isZoomed ? 2.5 : 1})`,
                  pointerEvents: 'none',
                }}
              />
            </Box>

            {/* Caption + CTA: fixed at bottom on mobile */}
            <Paper
              elevation={0}
              sx={{
                flexShrink: 0,
                p: { xs: 2.5, sm: 4 },
                borderRadius: isMobile ? 0 : undefined,
                borderTop: isMobile ? '1px solid' : undefined,
                borderColor: 'divider',
              }}
            >
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 900, letterSpacing: 2, fontSize: '10px' }}>{previewImage?.category?.toUpperCase()} INSPIRATION</Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '-0.02em', fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>{previewImage?.name}</Typography>
                {previewImage?.vibe && (
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mt: 0.5 }}>{previewImage.vibe}</Typography>
                )}
              </Box>
              <Button
                fullWidth
                variant="contained"
                onClick={() => previewImage && previewingForServiceId && handleSetServiceStyle(previewingForServiceId, previewImage.image)}
                sx={{
                  borderRadius: '100px',
                  bgcolor: 'text.primary',
                  color: 'background.paper',
                  py: 1.5,
                  fontWeight: 900,
                  letterSpacing: '0.1em',
                }}
              >
                CHOOSE THIS AESTHETIC
              </Button>
            </Paper>
          </Stack>
        </DialogContent>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity ?? 'error'} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default React.memo(BookingModal);