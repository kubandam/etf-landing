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
const done = ref(false)

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
    done.value = true
    track('form_submit', { placement: props.placement, variant, emailed: res.emailed })
    // Inline "Děkujeme" is the thank-you screen until step 7 replaces it.
    track('thankyou_view', { placement: props.placement, variant, emailed: res.emailed })
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
  <p v-if="done" role="status">{{ cs.form.thanks }}</p>
  <form v-else novalidate @submit.prevent="submit">
    <h2>{{ cs.form.heading }}</h2>
    <label :for="inputId">{{ cs.form.emailLabel }}</label>
    <input
      :id="inputId"
      v-model="email"
      type="email"
      name="email"
      autocomplete="email"
      inputmode="email"
      required
      :placeholder="cs.form.emailPlaceholder"
      @focus="onFocus"
      :aria-invalid="error === 'invalid_email'"
      :aria-describedby="error ? `${inputId}-error` : undefined"
    >
    <div aria-hidden="true" style="position: absolute; left: -9999px">
      <label :for="`${inputId}-website`">Web</label>
      <input :id="`${inputId}-website`" v-model="website" type="text" name="website" tabindex="-1" autocomplete="off">
    </div>
    <button type="submit" :disabled="sending">{{ sending ? cs.form.sending : cs.form.submit }}</button>
    <p v-if="error" :id="`${inputId}-error`" role="alert">{{ cs.form.errors[error] }}</p>
    <p><small>{{ cs.form.consent }}</small></p>
  </form>
</template>
