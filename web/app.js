const key = 'remittances';
const form = document.querySelector('#form');
const dialog = document.querySelector('#form-dialog');
const rows = document.querySelector('#rows');
let remittances = JSON.parse(localStorage.getItem(key) || '[]');
let editingId = null;

const cad = amount => `CA$${Number(amount).toFixed(2)}`;
const inr = amount => `₹${Math.round(amount).toLocaleString('en-IN')}`;
const escapeHTML = value => String(value).replace(/[&<>"']/g, char =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

function save() {
  localStorage.setItem(key, JSON.stringify(remittances));
  render();
}

function render() {
  rows.innerHTML = remittances.map(item => `
    <tr>
      <td>${escapeHTML(item.recipient)}</td><td>${escapeHTML(item.date)}</td><td>${escapeHTML(item.purpose)}</td>
      <td>${cad(item.amount)}</td><td>${inr(item.amount * item.rate)}</td>
      <td><button data-edit="${escapeHTML(item.id)}">Edit</button><button class="delete" data-delete="${escapeHTML(item.id)}">Delete</button></td>
    </tr>`).join('');

  document.querySelector('#empty').hidden = remittances.length > 0;
  document.querySelector('#sent-total').textContent = cad(remittances.reduce((sum, item) => sum + item.amount, 0));
  document.querySelector('#received-total').textContent = inr(remittances.reduce((sum, item) => sum + item.amount * item.rate, 0));
  document.querySelector('#count').textContent = remittances.length;
}

document.querySelector('#add').onclick = () => {
  editingId = null;
  form.reset();
  form.elements.date.value = new Date().toISOString().slice(0, 10);
  document.querySelector('#form-title').textContent = 'Add remittance';
  dialog.showModal();
};

document.querySelector('#cancel').onclick = () => dialog.close();

form.onsubmit = event => {
  event.preventDefault();
  const data = new FormData(form);
  const item = Object.fromEntries(data);
  item.amount = Number(item.amount);
  item.rate = Number(item.rate);

  if (editingId) {
    remittances = remittances.map(existing => existing.id === editingId ? { ...item, id: editingId } : existing);
  } else {
    remittances.push({ ...item, id: Date.now().toString() });
  }

  save();
  dialog.close();
};

rows.onclick = event => {
  const id = event.target.dataset.edit || event.target.dataset.delete;
  const item = remittances.find(entry => entry.id === id);
  if (!item) return;

  if (event.target.dataset.edit) {
    editingId = id;
    for (const field of ['recipient', 'amount', 'rate', 'date', 'purpose']) form.elements[field].value = item[field];
    document.querySelector('#form-title').textContent = 'Edit remittance';
    dialog.showModal();
  } else if (confirm(`Delete remittance for ${item.recipient}?`)) {
    remittances = remittances.filter(entry => entry.id !== id);
    save();
  }
};

render();
