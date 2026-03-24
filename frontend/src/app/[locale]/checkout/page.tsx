'use client';

import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { selectCartItems, selectCartTotal, clearCart } from '@/store/slices/cartSlice';
import { RootState } from '@/store';
import { ordersAPI, paymentsAPI } from '@/lib/api';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '@/components/Modal';
import { saveGuestOrder } from '@/lib/guestOrders';

const PHONE_REGEX = /^998 \(\d{2}\) \d{3}-\d{2}-\d{2}$/;
const CARD_NUMBER_REGEX = /^\d{4} \d{4} \d{4} \d{4}$/;
const EXPIRY_DATE_REGEX = /^(0[1-9]|1[0-2])\/\d{2}$/;
const CVC_REGEX = /^\d{3,4}$/;

const digitsOnly = (value: string) => value.replace(/\D/g, '');

const formatPhoneNumber = (value: string) => {
  const rawDigits = digitsOnly(value);
  if (!rawDigits) return '';

  const normalizedDigits = rawDigits.startsWith('998') ? rawDigits : `998${rawDigits}`;
  const digits = normalizedDigits.slice(3, 12);
  const part1 = digits.slice(0, 2);
  const part2 = digits.slice(2, 5);
  const part3 = digits.slice(5, 7);
  const part4 = digits.slice(7, 9);

  let formatted = '998';
  if (part1) formatted += ` (${part1}`;
  if (part1.length === 2) formatted += ')';
  if (part2) formatted += ` ${part2}`;
  if (part3) formatted += `-${part3}`;
  if (part4) formatted += `-${part4}`;

  return formatted;
};

const formatCardNumber = (value: string) =>
  digitsOnly(value)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ');

const formatExpiryDate = (value: string) => {
  const digits = digitsOnly(value).slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const formatCvc = (value: string) => digitsOnly(value).slice(0, 4);

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const tCommon = useTranslations('common');
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const router = useRouter();
  const dispatch = useDispatch();

  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const user = useSelector((state: RootState) => state.auth.user);

  const [form, setForm] = useState({
    customerName: user?.name || '',
    customerPhone: '',
    deliveryAddress: '',
    cardNumber: '',
    expiryDate: '',
    cvc: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [guestSuccessPath, setGuestSuccessPath] = useState('');
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const nextErrors = { ...prev };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.customerName.trim()) errs.customerName = t('name_required');
    if (!form.customerPhone.trim()) errs.customerPhone = t('phone_required');
    else if (!PHONE_REGEX.test(form.customerPhone)) errs.customerPhone = t('phone_invalid');
    if (!form.deliveryAddress.trim()) errs.deliveryAddress = t('address_required');
    if (!form.cardNumber.trim()) errs.cardNumber = t('card_number_required');
    else if (!CARD_NUMBER_REGEX.test(form.cardNumber)) errs.cardNumber = t('card_number_invalid');
    if (!form.expiryDate.trim()) errs.expiryDate = t('expiry_required');
    else if (!EXPIRY_DATE_REGEX.test(form.expiryDate)) errs.expiryDate = t('expiry_invalid');
    if (!form.cvc.trim()) errs.cvc = t('cvc_required');
    else if (!CVC_REGEX.test(form.cvc)) errs.cvc = t('cvc_invalid');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  useEffect(() => {
    if (items.length === 0 && !guestSuccessPath) {
      router.push(`/${locale}/cart`);
    }
  }, [items.length, guestSuccessPath, locale, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const orderData = {
        items: items.map((item) => ({
          foodId: item._id,
          quantity: item.quantity,
          price: item.price,
        })),
        totalPrice: total,
        ...form,
      };

      const orderRes = await ordersAPI.create(orderData);
      await paymentsAPI.process({ orderId: orderRes.data._id, method: 'card' });

      const successPath = `/${locale}/order-success?id=${orderRes.data._id}`;

      if (!user) {
        saveGuestOrder({
          _id: orderRes.data._id,
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          deliveryAddress: form.deliveryAddress,
          totalPrice: total,
          status: orderRes.data.status || 'pending',
          paymentStatus: 'paid',
          createdAt: orderRes.data.createdAt || new Date().toISOString(),
          items: items.map((item) => ({
            foodId: item._id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.image,
          })),
        });
      }

      dispatch(clearCart());

      if (!user) {
        setGuestSuccessPath(successPath);
        setShowGuestPrompt(true);
        return;
      }

      router.push(successPath);
    } catch (error) {
      console.error('Order failed:', error);
      toast.error(tCommon('error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuestLater = () => {
    if (guestSuccessPath) {
      router.push(guestSuccessPath);
    }
  };

  const handleCreateAccount = () => {
    if (!guestSuccessPath) return;
    router.push(`/${locale}/auth?mode=register&next=${encodeURIComponent(guestSuccessPath)}`);
  };

  if (items.length === 0 && !guestSuccessPath) {
    return null;
  }

  return (
    <>
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-foreground mb-8"
      >
        {t('title')}
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <motion.form
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onSubmit={handleSubmit}
          className="lg:col-span-3 space-y-5"
        >
            <div className="bg-card border border-border rounded-2xl p-5 space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{t('contact_details')}</h2>
                <p className="text-sm text-muted mt-1">{t('contact_hint')}</p>
              </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('name')}</label>
            <input
              type="text"
              value={form.customerName}
                  onChange={(e) => updateForm('customerName', e.target.value)}
              className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {errors.customerName && <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('phone')}</label>
            <input
              type="tel"
              value={form.customerPhone}
                  onChange={(e) => updateForm('customerPhone', formatPhoneNumber(e.target.value))}
                  placeholder={t('phone_placeholder')}
              className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
                <p className="text-xs text-muted mt-1">{t('phone_hint')}</p>
            {errors.customerPhone && <p className="text-red-500 text-sm mt-1">{errors.customerPhone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('address')}</label>
            <textarea
              value={form.deliveryAddress}
                  onChange={(e) => updateForm('deliveryAddress', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
            {errors.deliveryAddress && <p className="text-red-500 text-sm mt-1">{errors.deliveryAddress}</p>}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{t('card_details')}</h2>
                <p className="text-sm text-muted mt-1">{t('card_hint')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t('card_number')}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  value={form.cardNumber}
                  onChange={(e) => updateForm('cardNumber', formatCardNumber(e.target.value))}
                  placeholder={t('card_number_placeholder')}
                  className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">{t('expiry_date')}</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    value={form.expiryDate}
                    onChange={(e) => updateForm('expiryDate', formatExpiryDate(e.target.value))}
                    placeholder={t('expiry_date_placeholder')}
                    className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">{t('cvc')}</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    value={form.cvc}
                    onChange={(e) => updateForm('cvc', formatCvc(e.target.value))}
                    placeholder="123"
                    className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  {errors.cvc && <p className="text-red-500 text-sm mt-1">{errors.cvc}</p>}
                </div>
              </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {submitting ? t('processing') : t('place_order')}
          </motion.button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <div className="bg-card border border-border rounded-xl p-5 sticky top-24">
            <h3 className="font-semibold text-foreground mb-4">{t('order_summary')}</h3>
            <div className="space-y-3 mb-4">
              {items.map((item) => {
                const name = item.name[locale as keyof typeof item.name] || item.name.en;
                return (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span className="text-muted truncate mr-2">
                      {name} x{item.quantity}
                    </span>
                    <span className="font-medium text-foreground">
                      {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-border pt-3 flex justify-between">
              <span className="font-semibold text-foreground">{t('order_summary')}</span>
              <span className="font-bold text-primary text-lg">
                {total.toLocaleString()} {tCommon('sum')}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
      <Modal
        isOpen={showGuestPrompt}
        onClose={handleGuestLater}
        title={t('account_prompt_title')}
      >
        <p className="text-sm text-muted mb-5">{t('account_prompt_description')}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleCreateAccount}
            className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
          >
            {t('account_prompt_create')}
          </button>
          <button
            type="button"
            onClick={handleGuestLater}
            className="flex-1 border border-border py-3 rounded-xl font-semibold hover:bg-input transition-colors"
          >
            {t('account_prompt_later')}
          </button>
        </div>
      </Modal>
    </>
  );
}
