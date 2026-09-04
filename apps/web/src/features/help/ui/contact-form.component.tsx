import {
  Button,
  Card,
  Heading,
  Text,
  TextArea,
  TextField,
} from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';
import { type FormEvent, useState } from 'react';

type ContactFormValues = {
  name: string;
  surname: string;
  email: string;
  subject: string;
  message: string;
};

const EMPTY_FORM: ContactFormValues = {
  name: '',
  surname: '',
  email: '',
  subject: '',
  message: '',
};

type ContactFormProps = {
  /** Datos de la sesión con los que prerrellenar el formulario, si los hay. */
  initialValues?: Partial<ContactFormValues>;
  /** `h1` en /contact, donde el formulario es el encabezado de la página. */
  titleAs?: 'h1' | 'h2';
};

/**
 * Formulario de contacto compartido por /contact y ajustes › recursos.
 * El envío sigue siendo simulado (se guarda en localStorage): no hay endpoint
 * de soporte todavía.
 */
export function ContactForm({
  initialValues,
  titleAs = 'h2',
}: ContactFormProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState<ContactFormValues>({
    ...EMPTY_FORM,
    ...initialValues,
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    localStorage.setItem('logpose-contact-form', JSON.stringify(form));
    setForm({ ...EMPTY_FORM, ...initialValues });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Card size="3" className="w-full max-w-md border border-[#f2d9a8]/25">
        <Text as="p" size="3" className="leading-relaxed">
          {t('contact.success_message')}
        </Text>
        <Button
          mt="4"
          variant="soft"
          color="orange"
          onClick={() => setSubmitted(false)}
        >
          {t('contact.send_another')}
        </Button>
      </Card>
    );
  }

  return (
    <Card
      size="3"
      className="w-full max-w-md border border-[#f4ede1]/10 bg-linear-to-br from-[#1b2742]/55 to-[#0b1120]/65"
    >
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <Heading
          as={titleAs}
          size="5"
          align="center"
          className="font-one-piece text-[#f2d9a8]"
        >
          {t('contact.title')}
        </Heading>

        <label className="flex flex-col gap-1">
          <Text as="span" size="2" weight="bold">
            {t('auth.first_name')}
          </Text>
          <TextField.Root
            required
            value={form.name}
            placeholder={t('auth.first_name_placeholder')}
            onChange={event =>
              setForm(prev => ({ ...prev, name: event.target.value }))
            }
          />
        </label>

        <label className="flex flex-col gap-1">
          <Text as="span" size="2" weight="bold">
            {t('auth.last_name')}
          </Text>
          <TextField.Root
            required
            value={form.surname}
            placeholder={t('auth.last_name_placeholder')}
            onChange={event =>
              setForm(prev => ({ ...prev, surname: event.target.value }))
            }
          />
        </label>

        <label className="flex flex-col gap-1">
          <Text as="span" size="2" weight="bold">
            {t('auth.email')}
          </Text>
          <TextField.Root
            required
            type="email"
            value={form.email}
            placeholder={t('auth.email_placeholder')}
            onChange={event =>
              setForm(prev => ({ ...prev, email: event.target.value }))
            }
          />
        </label>

        <label className="flex flex-col gap-1">
          <Text as="span" size="2" weight="bold">
            {t('contact.subject')}
          </Text>
          <TextField.Root
            required
            value={form.subject}
            placeholder={t('contact.subject_placeholder')}
            onChange={event =>
              setForm(prev => ({ ...prev, subject: event.target.value }))
            }
          />
        </label>

        <label className="flex flex-col gap-1">
          <Text as="span" size="2" weight="bold">
            {t('contact.message')}
          </Text>
          <TextArea
            required
            rows={5}
            value={form.message}
            placeholder={t('contact.area_message')}
            onChange={event =>
              setForm(prev => ({ ...prev, message: event.target.value }))
            }
          />
        </label>

        <Button type="submit" color="orange" size="3">
          {t('contact.button')}
        </Button>
      </form>
    </Card>
  );
}
