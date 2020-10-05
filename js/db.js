db.enablePersistence().catch(err => {
    if (err.code == 'failed-precondition') {
        console.log('multiple tabs opened')
    } else if (err.code == 'unimplemented') {
        console.log('browser not support')
    }
})
const contactform = document.querySelector('.add-contact form');
const addContactModal = document.querySelector('#add_contact_modal');
const editform = document.querySelector('.edit-contact form');
const editContactModal = document.querySelector('#edit_contact_modal');
let updateId = null;
contactform.addEventListener('submit', e => {
    e.preventDefault();
    const contact = {
        name: contactform.name.value,
        phone: contactform.phone.value,
        favorite: false
    }
    db.collection('contacts').add(contact).then(() => {
        contactform.reset();
        var instance = M.Modal.getInstance(addContactModal);
        instance.close();
        contactform.querySelector('.error').textContent = '';

    }).catch(err => {
        contactform.querySelector('.error').textContent = err.message;
    })
})
editform.addEventListener('submit', e => {
    e.preventDefault();
    const contact = {
        name: editform.name.value,
        phone: editform.phone.value,
    }
    db.collection('contacts').doc(updateId).update(contact).then(() => {
        editform.reset();
        var instance = M.Modal.getInstance(editContactModal);
        instance.close();
        editform.querySelector('.error').textContent = '';

    }).catch(err => {
        editform.querySelector('.error').textContent = err.message;
    })
})

db.collection('contacts').onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
            if (window.location.pathname == '/' || window.location.pathname == '/index.html') {

                renderContacts(change.doc.data(), change.doc.id);
            }
            if (window.location.pathname == '/pages/favorites.html') {
                if (change.doc.data().favorite) {

                    renderContacts(change.doc.data(), change.doc.id);
                }
            }
        }
        if (change.type === 'removed') {
            removeContact(change.doc.id);
        }
        if (change.type === 'modified') {
            updateContact(change.doc.data(), change.doc.id);
        }
    })
})

const contactContainer = document.querySelector('.contacts');
contactContainer.addEventListener('click', e => {
    console.log('e.target.textContent', e.target.textContent);
    if (e.target.textContent === 'delete_outline') {
        const id = e.target.parentElement.getAttribute('data-id');
        db.collection('contacts').doc(id).delete()
    }
    if (e.target.textContent === 'edit') {
        updateId = e.target.parentElement.getAttribute('data-id');
        const contact = document.querySelector(`.contact[data-id=${updateId}]`);
        const name = contact.querySelector('.name').innerHTML;
        const phone = contact.querySelector('.phone').innerHTML;
        editform.name.value = name;
        editform.phone.value = phone;

    }
    if (e.target.textContent === 'star_border') {
        const id = e.target.parentElement.getAttribute('data-id');
        contact = { favorite: true };
        db.collection('contacts').doc(id).update(contact);
    }
    if (e.target.textContent === 'star') {
        const id = e.target.parentElement.getAttribute('data-id');
        contact = { favorite: false };
        db.collection('contacts').doc(id).update(contact);
    }

})