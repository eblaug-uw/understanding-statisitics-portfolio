const tocList = document.getElementById('tocList');
// Table of Contents name graber
document.querySelectorAll('main.content section').forEach(section =>{
    const heading = section.querySelector('h2');
    if(!heading)
        return;

    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#' + section.id;
    a.textContent = heading.textContent;
    li.appendChild(a);
    tocList.appendChild(li);
});

// auto open Collapsed Sections
function openSection(id){
    if (!id)
        return;

    const details = document.querySelector('#' + id + ' details');
    if(details)
        details.open = true;
}
tocList.addEventListener('click', e => {
    const link = e.target.closest('a');
    if (link) 
        openSection(link.getAttribute('href').slice(1));
});

window.addEventListener('hashchange', () => openSection(location.hash.slice(1)));
if(location.hash)
    openSection(location.hash.slice(1));
