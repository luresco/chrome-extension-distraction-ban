const daysMap = {
    0: "Do",
    1: "Lun",
    2: "Mar",
    3: "Mie",
    4: "Jue",
    5: "Vie",
    6: "Sa",
}


document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('block-form');
    const blockedWebsitesUl = document.getElementById('blocked-websites');
    const allDays = document.getElementById('all-days');
    const alwaysBlocked = document.getElementById('always-blocked');
    const block24h = document.getElementById('block-24-h');
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const url = document.getElementById('url').value;
      const days = Array.from(document.querySelectorAll('input[name="days"]:checked')).map(element => parseInt(element.value));
      const isAllDays = allDays.checked
      const isAlwaysBlocked = alwaysBlocked.checked
      const isBlock24h = block24h.checked
      
      if(!isAlwaysBlocked) {
        if(!isBlock24h) {
          if(!document.getElementById('startTime').value) {
            alert("Invalid startTime")
            return
          }
    
          if(!document.getElementById('endTime').value) {
            alert("Invalid endTime")
            return
          }
        }
  
        if(!isAllDays && days.length === 0) {
          alert("Select at least one day or all days")
          return
        }
      }

      const startTime = document.getElementById('startTime').value.split(':');
      const endTime = document.getElementById('endTime').value.split(':');
  
      const startTimeMinutes = parseInt(startTime[0]) * 60 + parseInt(startTime[1]);
      const endTimeMinutes = parseInt(endTime[0]) * 60 + parseInt(endTime[1]);
  
      const newWebsite = {
        url,
        days,
        startTime: startTimeMinutes,
        endTime: endTimeMinutes,
        isAllDays: isAllDays,
        isBlock24h: isBlock24h,
        isAlwaysBlocked: isAlwaysBlocked,
      };
  
      const blockedWebsites = await new Promise((resolve) => {
        chrome.storage.local.get(['blockedWebsites'], (result) => {
          resolve(result.blockedWebsites || []);
        });
      });
  
      blockedWebsites.push(newWebsite);
  
      chrome.storage.local.set({ blockedWebsites }, () => {
        renderBlockedWebsites();
      });
    });
  
    const renderBlockedWebsites = async () => {
      const blockedWebsites = await new Promise((resolve) => {
        chrome.storage.local.get(['blockedWebsites'], (result) => {
          resolve(result.blockedWebsites || []);
        });
      });
  
      blockedWebsitesUl.innerHTML = ''; // Clear the list
  
      blockedWebsites.forEach((site, index) => {
        const daysFormat = site.days.map(x => daysMap[x])

        const daysText = site.isAlwaysBlocked || site.isAllDays ? "Blocked all days of the week" : daysFormat.join(', ')
        const timeText = site.isAlwaysBlocked || site.isBlock24h ? "Blocked all day" : `${formatTime(site.startTime)} to ${formatTime(site.endTime)}`
        const siteLi = document.createElement('li');
        siteLi.innerHTML = `
          <strong>${site.url}</strong><br/>
          ${daysText}<br/>
          ${timeText}<br/>
          <button data-index="${index}" class="delete-btn">Delete</button>
        `;
        blockedWebsitesUl.appendChild(siteLi);
      });
  
      document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
          const index = e.target.dataset.index;
  
          blockedWebsites.splice(index, 1);
  
          chrome.storage.local.set({ blockedWebsites }, () => {
            renderBlockedWebsites();
          });
        });
      });
    };
  
    const formatTime = (minutes) => {
      const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
      const mins = (minutes % 60).toString().padStart(2, '0');
      return `${hours}:${mins}`;
    };
  
    renderBlockedWebsites();
  });
  