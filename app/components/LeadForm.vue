<script setup lang="ts">
import { cs } from '#shared/content/cs'

const props = defineProps<{ placement: 'top' | 'bottom' }>()
const emit = defineEmits<{ submitted: [payload: { emailed: boolean }] }>()

// monthly/years are sent even if the calculator was never touched (defaults 3 000 / 20).
const { monthly, years } = useCalculator()
const variant = useVariant()

type ErrorKey = keyof typeof cs.form.errors
const email = ref('')
const website = ref('') // honeypot
const sending = ref(false)
const error = ref<ErrorKey | null>(null)
const submitted = useLead()

const inputId = `lead-email-${props.placement}`

const track = useTrack()
let focused = false
function onFocus() {
  if (focused) return
  focused = true
  track('form_focus', { placement: props.placement })
}

async function submit() {
  if (sending.value) return
  sending.value = true
  error.value = null
  try {
    const res = await $fetch<{ ok: true; emailed: boolean }>('/api/lead', {
      method: 'POST',
      body: { email: email.value, monthly: monthly.value, years: years.value, variant, website: website.value },
    })
    track('form_submit', { placement: props.placement, variant, emailed: res.emailed })
    // Snapshot the numbers the server got, so the thank-you screen matches the e-mail.
    submitted.value = { placement: props.placement, monthly: monthly.value, years: years.value, emailed: res.emailed }
    emit('submitted', { emailed: res.emailed })
  }
  catch (e: any) {
    const code = e?.data?.error
    error.value = code && code in cs.form.errors ? code : 'network'
  }
  finally {
    sending.value = false
  }
}
</script>

<template>
  <section class="lead">
    <form novalidate @submit.prevent="submit">
      <h2 class="heading">{{ cs.form.heading }}</h2>
      <label :for="inputId" class="label">{{ cs.form.emailLabel }}</label>
      <input
        :id="inputId"
        v-model="email"
        class="field"
        type="email"
        name="email"
        autocomplete="email"
        inputmode="email"
        required
        :placeholder="cs.form.emailPlaceholder"
        :aria-invalid="error === 'invalid_email'"
        :aria-describedby="error ? `${inputId}-error` : undefined"
        @focus="onFocus"
      >
      <div aria-hidden="true" class="trap">
        <label :for="`${inputId}-website`">Web</label>
        <input :id="`${inputId}-website`" v-model="website" type="text" name="website" tabindex="-1" autocomplete="off">
      </div>
      <p v-if="error" :id="`${inputId}-error`" class="error" role="alert">{{ cs.form.errors[error] }}</p>
      <button type="submit" class="submit" :disabled="sending">{{ sending ? cs.form.sending : cs.form.submit }}</button>
      <p class="small consent">{{ cs.form.consent }}</p>
    </form>
  </section>
</template>

<style scoped>
.lead {
  margin-top: var(--space-6);
  padding-top: var(--space-5);
  border-top: 1px solid var(--ink);
}

.heading {
  font-family: var(--font-serif);
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.3;
}

.label {
  display: block;
  margin-top: var(--space-4);
  font-size: 0.875rem;
  color: var(--muted);
}

.field {
  display: block;
  width: 100%;
  min-height: 48px;
  margin-top: var(--space-1);
  padding: 0 var(--space-3);
  background: var(--field);
  border: 1px solid var(--ink);
  border-radius: var(--radius);
}

.field[aria-invalid='true'] {
  border-color: var(--rust);
  border-width: 2px;
}

.trap {
  position: absolute;
  left: -9999px;
}

.error {
  margin-top: var(--space-2);
  color: var(--rust);
  font-size: 0.9375rem;
}

.submit {
  display: block;
  width: 100%;
  min-height: 52px;
  margin-top: var(--space-3);
  background: var(--ink);
  color: var(--paper);
  border: 0;
  border-radius: var(--radius);
  font-weight: 600;
  cursor: pointer;
}

.submit:disabled {
  opacity: 0.6;
  cursor: progress;
}

.consent {
  margin-top: var(--space-3);
}
</style>
