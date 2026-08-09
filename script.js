// Enhanced JS: calendar handling, quick RSVP buttons, and Formspree submission
document.addEventListener('DOMContentLoaded', function(){
  const form = document.getElementById('rsvp-form');
  const statusEl = document.getElementById('form-status');
  const calendarLink = document.getElementById('calendar-link');
  const yesBtn = document.getElementById('rsvp-yes');
  const noBtn = document.getElementById('rsvp-no');

  // Detect Apple devices (iPhone/iPad) to use .ics
  if (calendarLink) {
    const ua = navigator.userAgent || '';
    const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOS) {
      calendarLink.setAttribute('href', 'event.ics');
      calendarLink.setAttribute('download', 'birthday.ics');
      calendarLink.textContent = 'Добавить в Apple Calendar';
    }
  }

  // Quick RSVP buttons prefill and submit
  async function sendSimpleRSVP(answer) {
    // try to fill form and submit via fetch
    if (!form) return;
    const nameField = document.getElementById('name');
    const msgField = document.getElementById('message');
    if(nameField && !nameField.value) nameField.value = answer === 'yes' ? 'Буду' : 'Не приду';
    if(msgField && !msgField.value) msgField.value = answer === 'yes' ? 'Подтверждаю участие' : 'К сожалению, не смогу прийти';

    // submit programmatically
    try {
      const action = form.getAttribute('action');
      const formData = new FormData(form);
      formData.append('attendance', answer);
      statusEl.textContent = 'Отправка...';
      const res = await fetch(action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData
      });
      if (res.ok) {
        statusEl.textContent = 'Спасибо! RSVP отправлен.';
        form.reset();
      } else {
        statusEl.textContent = 'Ошибка при отправке. Попробуйте заполнить форму вручную.';
      }
    } catch (err) {
      console.error(err);
      statusEl.textContent = 'Ошибка сети. Попробуйте позже.';
    }
  }

  if (yesBtn) yesBtn.addEventListener('click', function(){ sendSimpleRSVP('yes'); });
  if (noBtn) noBtn.addEventListener('click', function(){ sendSimpleRSVP('no'); });

  // Full form submit handler
  if (form) {
    form.addEventListener('submit', async function(e){
      e.preventDefault();
      statusEl.textContent = 'Отправка...';

      const action = form.getAttribute('action');
      if(!action || action.includes('{your-form-id}')){
        statusEl.textContent = 'Пожалуйста, замените action формы на ваш Formspree endpoint или используйте кнопку e-mail.';
        return;
      }

      const formData = new FormData(form);
      try{
        const res = await fetch(action, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: formData
        });

        if(res.ok){
          statusEl.textContent = 'Спасибо! RSVP отправлен.';
          form.reset();
        } else {
          const data = await res.json().catch(()=>null);
          statusEl.textContent = data && data.error ? `Ошибка: ${data.error}` : 'Ошибка при отправке. Попробуйте снова.';
        }
      }catch(err){
        statusEl.textContent = 'Ошибка сети. Попробуйте ещё раз.';
        console.error(err);
      }
    });
  }
});