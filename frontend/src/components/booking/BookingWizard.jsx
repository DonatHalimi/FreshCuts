import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAvailability } from '../../services/availability.api.js';
import { createAppointment } from '../../services/appointments.api.js';
import { getProvider, getProvidersForService } from '../../services/providers.api.js';
import { getServices } from '../../services/services.api.js';
import { formatDate, formatTime, localDateInputValue, nextBookingDateInputValue } from '../../utils/dates.js';
import { money } from '../../utils/money.js';
import Alert from '../ui/Alert.jsx';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import DropdownSelect from '../ui/DropdownSelect.jsx';
import Spinner from '../ui/Spinner.jsx';

export function BookingWizard({ onBooked }) {
  const [params] = useSearchParams();
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [serviceId, setServiceId] = useState(params.get('serviceId') || '');
  const [providerId, setProviderId] = useState(params.get('providerId') || '');
  const [date, setDate] = useState(nextBookingDateInputValue());
  const [availability, setAvailability] = useState(null);
  const [selected, setSelected] = useState(null);
  const [catalogState, setCatalogState] = useState('loading');
  const [providerState, setProviderState] = useState('idle');
  const [availabilityState, setAvailabilityState] = useState('idle');
  const [catalogError, setCatalogError] = useState('');
  const [providerError, setProviderError] = useState('');
  const [availabilityError, setAvailabilityError] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [booking, setBooking] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const pendingRequest = useRef(null);
  const requestedProviderId = useRef(params.get('providerId') || '');

  useEffect(() => {
    let current = true;
    getServices()
      .then((result) => {
        if (!current) return;
        setServices(result);
        setCatalogState('ready');
      })
      .catch((error) => {
        if (!current) return;
        setCatalogError(error.message);
        setCatalogState('error');
      });

    return () => {
      current = false;
    };
  }, []);

  useEffect(() => {
    if (catalogState !== 'ready' || !requestedProviderId.current || serviceId) return undefined;
    const requestedId = requestedProviderId.current;
    let current = true;

    getProvider(requestedId)
      .then((selectedProvider) => {
        if (!current) return;
        requestedProviderId.current = '';
        const firstAvailableService = selectedProvider.services.find((item) =>
          services.some((serviceItem) => serviceItem.id === item.id),
        );
        setProviderId(selectedProvider.id);
        if (firstAvailableService) {
          setServiceId(firstAvailableService.id);
        } else {
          setBookingError('This barber currently has no available services to book.');
        }
      })
      .catch((error) => {
        if (!current) return;
        requestedProviderId.current = '';
        setBookingError(error.message);
      });

    return () => {
      current = false;
    };
  }, [catalogState, services, serviceId]);

  useEffect(() => {
    let current = true;
    setProviders([]);
    setProviderError('');
    setProviderState(serviceId ? 'loading' : 'idle');

    if (!serviceId) return undefined;

    getProvidersForService(serviceId)
      .then((availableProviders) => {
        if (!current) return;
        setProviders(availableProviders);
        setProviderId((selectedProviderId) =>
          availableProviders.some((provider) => provider.id === selectedProviderId)
            ? selectedProviderId
            : '',
        );
        setProviderState('ready');
      })
      .catch((error) => {
        if (!current) return;
        setProviderState('error');
        setProviderError(error.message);
      });

    return () => {
      current = false;
    };
  }, [serviceId]);

  useEffect(() => {
    let current = true;
    setSelected(null);
    setAvailability(null);
    setAvailabilityError('');
    setBookingError('');
    setAvailabilityState('idle');

    if (!serviceId || !providerId || !date || providerState !== 'ready') {
      return undefined;
    }

    setAvailabilityState('loading');
    getAvailability({ serviceId, providerId, date })
      .then((result) => {
        if (!current) return;
        setAvailability(result);
        setAvailabilityState('ready');
      })
      .catch((error) => {
        if (!current) return;
        setAvailabilityError(error.message);
        setAvailabilityState('error');
      });

    return () => {
      current = false;
    };
  }, [serviceId, providerId, date, providerState, refreshVersion]);

  const service = useMemo(
    () => services.find((item) => item.id === serviceId),
    [services, serviceId],
  );
  const provider = useMemo(
    () => providers.find((item) => item.id === providerId),
    [providers, providerId],
  );
  const providerService = provider?.services?.find((item) => item.id === serviceId);
  const displayedPrice = availability?.priceCents ?? providerService?.priceCents ?? service?.priceCents;

  const updateService = (nextServiceId) => {
    setServiceId(nextServiceId);
    setProviderId('');
    setSelected(null);
    setAvailability(null);
    setBookingError('');
    pendingRequest.current = null;
  };

  const updateProvider = (nextProviderId) => {
    setProviderId(nextProviderId);
    setSelected(null);
    setAvailability(null);
    setBookingError('');
    pendingRequest.current = null;
  };

  const updateDate = (nextDate) => {
    setDate(nextDate);
    setSelected(null);
    setBookingError('');
    pendingRequest.current = null;
  };

  const book = async () => {
    if (!selected || !serviceId || !providerId || booking) return;

    setBookingError('');
    setBooking(true);
    const payload = { providerId, serviceId, startAt: selected.startAt };
    const requestFingerprint = `${providerId}:${serviceId}:${selected.startAt}`;
    if (pendingRequest.current?.fingerprint !== requestFingerprint) {
      pendingRequest.current = {
        fingerprint: requestFingerprint,
        key: crypto.randomUUID(),
      };
    }

    try {
      const appointment = await createAppointment(payload, pendingRequest.current.key);
      pendingRequest.current = null;
      onBooked?.(appointment);
    } catch (error) {
      setBookingError(error.message);
      if (error.code === 'SLOT_UNAVAILABLE') {
        setSelected(null);
        setRefreshVersion((version) => version + 1);
      }
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="p-6">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">
          1 · Choose
        </div>
        <h2 className="mt-2 text-xl font-semibold">Service and barber</h2>

        {catalogState === 'error' ? (
          <div className="mt-5"><Alert>{catalogError}</Alert></div>
        ) : null}

        <div className="mt-6 space-y-4">
          <DropdownSelect
            id="serviceId"
            label="Service"
            value={serviceId}
            disabled={catalogState !== 'ready'}
            onChange={updateService}
            options={[
              { value: '', label: 'Select a service' },
              ...services.map((item) => ({
                value: item.id,
                label: `${item.name} · ${money(item.priceCents)}`,
              })),
            ]}
          />

          <DropdownSelect
            id="providerId"
            label="Barber"
            value={providerId}
            disabled={!serviceId || providerState !== 'ready'}
            onChange={updateProvider}
            options={[
              {
                value: '',
                label: providerState === 'loading' ? 'Loading barbers…' : 'Select a barber',
              },
              ...providers.map((item) => ({
                value: item.id,
                label: `${item.name}${item.title ? ` · ${item.title}` : ''}`,
              })),
            ]}
          />
          {providerState === 'ready' && serviceId && providers.length === 0 ? (
            <Alert tone="info">No barbers currently offer this service.</Alert>
          ) : null}
          {providerState === 'error' ? <Alert>{providerError}</Alert> : null}

          <label className="block space-y-2" htmlFor="booking-date">
            <span className="text-sm font-medium text-text">Date</span>
            <input
              id="booking-date"
              type="date"
              min={localDateInputValue()}
              value={date}
              onChange={(event) => updateDate(event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3.5 py-3 text-sm text-text outline-none focus:border-sage focus:ring-2 focus:ring-sage/15"
            />
          </label>
        </div>

        {service && provider ? (
          <div className="mt-6 rounded-xl border border-border bg-surface-2 p-4">
            <div className="text-sm font-medium text-text">
              {service.name} with {provider.name}
            </div>
            <div className="mt-2 text-xs text-muted">
              {service.durationMin} min · {displayedPrice == null ? 'Price unavailable' : money(displayedPrice)}
            </div>
          </div>
        ) : null}
      </Card>

      <Card className="p-6">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">
          2 · Choose a time
        </div>
        <h2 className="mt-2 text-xl font-semibold">Available appointments</h2>

        {availabilityState === 'loading' ? (
          <div className="grid min-h-48 place-items-center" role="status" aria-live="polite">
            <Spinner />
            <span className="sr-only">Checking available times</span>
          </div>
        ) : availabilityState === 'error' ? (
          <div className="mt-5"><Alert>{availabilityError}</Alert></div>
        ) : availabilityState === 'ready' && availability?.slots?.length ? (
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {availability.slots.map((slot) => (
              <button
                type="button"
                key={slot.startAt}
                aria-pressed={selected?.startAt === slot.startAt}
                onClick={() => {
                  setSelected(slot);
                  setBookingError('');
                }}
                className={`rounded-lg border px-3 py-3 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-bright ${
                  selected?.startAt === slot.startAt
                    ? 'border-sage bg-sage text-background'
                    : 'border-border bg-background text-text hover:bg-surface-2'
                }`}
              >
                {formatTime(slot.startAt)}
              </button>
            ))}
          </div>
        ) : availabilityState === 'ready' ? (
          <div className="mt-5">
            <Alert tone="info">No available times for this barber on this date. Try another day.</Alert>
          </div>
        ) : (
          <div className="mt-5">
            <Alert tone="info">Choose a service and barber to see live availability.</Alert>
          </div>
        )}

        {bookingError ? <div className="mt-4"><Alert>{bookingError}</Alert></div> : null}

        {selected && service && provider ? (
          <div className="mt-6 border-t border-border pt-5">
            <h3 className="text-sm font-semibold text-text">Review your appointment</h3>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted">Service</dt>
                <dd className="mt-1 text-text">{service.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Barber</dt>
                <dd className="mt-1 text-text">{provider.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Date and time</dt>
                <dd className="mt-1 text-text">
                  {formatDate(`${date}T12:00:00`)} · {formatTime(selected.startAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Duration · price</dt>
                <dd className="mt-1 text-text">
                  {service.durationMin} min · {displayedPrice == null ? 'Price unavailable' : money(displayedPrice)}
                </dd>
              </div>
            </dl>
            <Button
              className="mt-5 w-full"
              loading={booking}
              disabled={booking || displayedPrice == null}
              onClick={book}
            >
              Confirm appointment
            </Button>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
