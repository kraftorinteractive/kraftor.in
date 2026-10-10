export function composeMessage(values, career = false) {
  const fields = career ? [['name','Name'],['email','Email'],['role','Interested in'],['portfolio','Portfolio / CV link'],['message','Introduction']] : [['name','Name'],['company','Company'],['phone','Phone'],['email','Email'],['whatsapp','WhatsApp'],['country','Country'],['service','Project type'],['projectName','Project name'],['budget','Budget'],['projectInfo','Project info']];
  return fields.filter(([key]) => values[key]?.trim()).map(([key,label]) => `${label}: ${values[key].trim()}`).join('\n\n');
}
export function emailLink(values, career = false) {
  return `mailto:info@kraftor.in?subject=${encodeURIComponent(career ? 'Career enquiry — Kraftor' : 'New project enquiry — Kraftor')}&body=${encodeURIComponent(composeMessage(values, career))}`;
}
export function whatsappLink(values) {
  return `https://wa.me/917378626422?text=${encodeURIComponent(composeMessage(values))}`;
}
