import { useStore } from './store';
import { resolvePID, formatDate, formatDateShort } from './utils';

// 房间类型积分
const roomTypes = {
  HIR: [
    { types: ['TSTS', 'TSTN', 'KPUS', 'TPUN', 'TPU'], promotion: 188 },
    { types: ['TVUN', 'TVUS', 'KLON', 'KLOS'], promotion: 188 },
    { types: ['KOTS', 'TOTS'], promotion: 388 },
    { types: ['XOTN', 'XOTS', 'XFTN', 'XFTS', 'XLOS', 'XCIS'], promotion: 888 },
    { types: ['X2ON', 'X2OS', 'XDBS'], promotion: 1888 },
    { types: ['XVUN', 'XVUS'], promotion: 2188 },
    { types: ['X2AN', 'X2AS'], promotion: 3188 }
  ],
  IC: [
    { types: ['KDXN', 'KDXS', 'TDXN', 'TDXS', 'KLON', 'KLOS', 'TLON', 'TLOS'], promotion: 188 },
    { types: ['KOTS', 'KOTN', 'TOTS', 'TOTN'], promotion: 188 },
    { types: ['KVUS', 'KVUN', 'TVUS', 'TVUN'], promotion: 388 },
    { types: ['XEXS', 'XEXN', 'XOTS', 'XOTN', 'XVUS', 'XVUN'], promotion: 3188 },
    { types: ['XFTS', 'XFTN', 'XLOS', 'XLON'], promotion: 3888 }
  ]
};

export function useEmailGenerator() {
  const { booking } = useStore();
  
  const generateRoomEmail = (): { subject: string; body: string } => {
    const rb = booking.roomBooking;
    if (!rb) return { subject: '', body: '' };
    
    const agent = rb.agent;
    const hotel = rb.hotel;
    const authorizer = rb.authorizer;
    const checkIn = formatDate(rb.checkIn);
    const checkOut = formatDate(rb.checkOut);
    const rateCode = rb.rateCode;
    const deposit = rb.deposit;
    
    // V2.0.41: 找到第一个有效的客人（不一定是index 0）
    let firstValidGuest = null;
    for (const guest of rb.guests) {
      if (guest.name) {
        firstValidGuest = guest;
        break;
      }
    }
    
    // V2.0.41: 如果没有有效客人，返回空
    if (!firstValidGuest) {
      return { subject: '', body: '' };
    }
    
    const firstGuestPID = resolvePID(firstValidGuest.oldPID, firstValidGuest.newPID);
    const firstGuestName = firstValidGuest.name;
    
    // 收集客人信息
    const guestLines: string[] = [];
    const roomLines: string[] = [];
    const promotions: number[] = [];
    
    rb.guests.forEach((guest) => {
      // V2.0.41: 跳过没有姓名的客人
      if (!guest.name || !guest.roomType) return;
      
      const pid = resolvePID(guest.oldPID, guest.newPID);
      let line = `${guest.name} - ${pid}`;
      
      // V2.0.40: 支持多sharers
      if (guest.sharers && guest.sharers.length > 0) {
        const sharerLines = guest.sharers
          .filter(s => s.name) // 只显示有名字的sharer
          .map(s => {
            const sharerPID = resolvePID(s.oldPID, s.newPID);
            return `(Sharer: ${s.name} - ${sharerPID})`;
          });
        
        if (sharerLines.length > 0) {
          line += '\n' + sharerLines.join('\n');
        }
      }
      
      guestLines.push(line);
      roomLines.push(`${guest.name} - ${guest.roomType}`);
      
      // 查找积分
      const hotelTypes = roomTypes[hotel as keyof typeof roomTypes];
      if (hotelTypes) {
        hotelTypes.forEach(group => {
          if (group.types.includes(guest.roomType!) && !promotions.includes(group.promotion)) {
            promotions.push(group.promotion);
          }
        });
      }
    });
    
    // V2.0.41: 如果没有有效的客人行，返回空
    if (guestLines.length === 0) {
      return { subject: '', body: '' };
    }
    
    const subject = `[${agent}] ${firstGuestPID} ${firstGuestName} ${hotel} Hotel Room Booking on ${checkIn}`;
    
    const body = `Dear RC team,

Kindly assist us make room booking as below:

Guest name: ${guestLines.join('\n')}

Room type: ${hotel}
${roomLines.join('\n')}

Check in: ${checkIn}
Check out: ${checkOut}
Rate code: ${rateCode}
Promotion: ${promotions.join('/')}
Deposit: ${deposit}
Trip authorizer: ${authorizer}`;
    
    return { subject, body };
  };
  
  const generateCarEmail = (): { subject: string; body: string } => {
    const isStandalone = !booking.roomBooking;
    
    const carDetails = booking.carServices.map((car, idx) => {
      if (!car.name || !car.date || !car.time) return '';
      
      const formattedDate = formatDateShort(car.date);
      
      return `${idx + 1}, Car Type: ${car.carType}

Name: ${car.name}

Number of guests: ${car.guests}

Phone: ${car.phone}

Date & time: ${car.time} ${formattedDate}

Pick up point: ${car.pickup}

Drop off point: ${car.dropoff}`;
    }).filter(Boolean).join('\n\n');
    
    const firstCar = booking.carServices[0];
    const payment = firstCar?.payment || 'Free Comp (If guest enough 2000 points)';
    const authorizer = firstCar?.authorizer || 'xujian';
    
    // Standalone 标题格式
    let subject = 'VIP Car Service Request';
    if (isStandalone && firstCar) {
      const agent = booking.roomBooking?.agent || '';
      const pid = resolvePID(firstCar.oldPID, firstCar.newPID);
      const date = formatDate(firstCar.date);
      if (agent && firstCar.name) {
        subject = `[${agent}] ${pid} ${firstCar.name} Car Service ${date}`;
      }
    }
    
    const body = `Dear @Concierge Services

Please kindly arrange a VIP car as the followings:

${carDetails}

Payment: ${payment}
Authorizer: ${authorizer}`;
    
    return { subject, body };
  };
  
  const generateGolfEmail = (): { subject: string; body: string } => {
    const gb = booking.golfBooking;
    if (!gb) return { subject: '', body: '' };
    
    const isStandalone = !booking.roomBooking;
    
    const guestNames = gb.guests
      .filter(g => g.name)
      .map(g => `${g.name} - ${resolvePID(g.oldPID, g.newPID)}`);
    
    const dt = new Date(gb.dateTime);
    const time = dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const date = formatDateShort(gb.dateTime?.split('T')[0] || '');
    
    let subject = 'Golf Booking Request';
    if (isStandalone && gb.guests[0]) {
      const agent = booking.roomBooking?.agent || '';
      const firstGuest = gb.guests[0];
      const pid = resolvePID(firstGuest.oldPID, firstGuest.newPID);
      if (agent && firstGuest.name) {
        subject = `[${agent}] ${pid} ${firstGuest.name} Golf Booking ${date}`;
      }
    }
    
    const body = `Dear @The Bluffs Ho Tram - Bookings

Guest's name:

${guestNames.join('\n')}

Date & Time: ${date} ${time}

No. of pax: ${gb.pax}

Note: ${gb.note}

Payment: ${gb.payment}

Authorizer: ${gb.authorizer}`;
    
    return { subject, body };
  };
  
  const generateBusEmail = (): { subject: string; body: string } => {
    const bs = booking.busService;
    if (!bs) return { subject: '', body: '' };
    
    const isStandalone = !booking.roomBooking;
    
    let busContent = `Hi @Grand Service

Please help to arrange bus seats as below:

Name: ${bs.passenger}
`;
    
    if (bs.routes.hcmToHt && bs.routes.hcmToHtDetails) {
      const { time, date, seats } = bs.routes.hcmToHtDetails;
      busContent += `
Route: HCM to HT ${time} ${formatDateShort(date)}
Seats: ${seats}
`;
    }
    
    if (bs.routes.htToHcm && bs.routes.htToHcmDetails) {
      const { time, date, seats } = bs.routes.htToHcmDetails;
      busContent += `
Route: HT to HCM ${time} ${formatDateShort(date)}
Seats: ${seats}
`;
    }
    
    busContent += `
Authorizer: ${bs.authorizer}`;
    
    let subject = 'Bus Service Request';
    if (isStandalone) {
      const agent = booking.roomBooking?.agent || '';
      const pid = resolvePID(bs.oldPID, bs.newPID);
      const date = formatDate(
        bs.routes.hcmToHt ? (bs.routes.hcmToHtDetails?.date || '') :
        bs.routes.htToHcm ? (bs.routes.htToHcmDetails?.date || '') : ''
      );
      if (agent && bs.passenger) {
        subject = `[${agent}] ${pid} ${bs.passenger} Bus Service ${date}`;
      }
    }
    
    return { subject, body: busContent };
  };
  
  const generateOneDayTripEmail = (): { subject: string; body: string; isOneDayTrip: boolean } => {
    const odt = booking.oneDayTrip;
    if (!odt) return { subject: '', body: '', isOneDayTrip: false };
    
    const names = odt.guests.filter(g => g.name).map(g => g.name);
    const pids = odt.guests.filter(g => g.name).map(g => resolvePID(g.oldPID, g.newPID));
    
    if (names.length === 0) return { subject: '', body: '', isOneDayTrip: false };
    
    const agent = odt.agent;
    const dateStr = formatDate(odt.date);
    const firstName = names[0];
    const firstPID = pids[0];
    
    let subject = '';
    let body = '';
    
    if (odt.subjectType === 'oneday') {
      subject = `[${agent}] ${firstPID} ${firstName} One Day Trip ${dateStr}`;
      const guestLines = names.map((name, idx) => `${pids[idx]} ${name}`).join(',\n');
      
      body = `Dear @The Grand Ho Tram - HTR Management @The Grand Ho Tram - Casino Audit

Please note that the guest one day trip : 
${guestLines}`;
    } else {
      subject = `[${agent}] Patron Registration - ${firstName} ${dateStr}`;
      
      body = `Dear @The Grand Ho Tram - HTR Management @The Grand Ho Tram - Casino Audit

Please allow for signing manifest form.  

Patrons do not need room.  

Please see attached for more information:

${names.join('\n')}`;
    }
    
    return { subject, body, isOneDayTrip: odt.subjectType === 'oneday' };
  };
  
  const generateAllEmails = (): { email: string; subject: string; isOneDayTrip: boolean } | null => {
    // One Day Trip 模式
    if (booking.isOneDayTripMode) {
      const result = generateOneDayTripEmail();
      if (!result.subject) return null;
      return {
        email: `Subject: ${result.subject}\n\n${result.body}`,
        subject: result.subject,
        isOneDayTrip: result.isOneDayTrip,
      };
    }
    
    // 验证日期
    if (booking.selectedServices.has('room')) {
      if (!booking.roomBooking?.checkIn || !booking.roomBooking?.checkOut) {
        alert('⚠️ Please select stay dates before generating the email.');
        return null;
      }
      
      // V2.0.37: 验证日期 - 入住日期最早为明天
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkIn = new Date(booking.roomBooking.checkIn);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // V2.0.38: 允许过去日期（补录模式），只给出警告
      if (checkIn < tomorrow) {
        const isBackdated = confirm('⚠️ Check-in date is earlier than tomorrow. This appears to be a backdated booking. Continue?');
        if (!isBackdated) return null;
      }
      
      // V2.0.22: 验证房型 - 只验证有姓名的客人
      for (const guest of booking.roomBooking.guests) {
        // V2.0.41: 跳过没有姓名的客人
        if (!guest.name) continue;
        
        if (!guest.roomType) {
          alert(`⚠️ Please select a Room Type for all guests before generating the email.`);
          return null;
        }
      }
      
      // V2.0.41: 验证至少有一个有效客人
      const hasValidGuest = booking.roomBooking.guests.some(g => g.name && g.roomType);
      if (!hasValidGuest) {
        alert('⚠️ Please fill in at least one guest with name and room type.');
        return null;
      }
    }
    
    let combinedBody = '';
    let subject = '';
    const services: string[] = [];
    
    if (booking.selectedServices.has('room')) {
      services.push('Room');
      const room = generateRoomEmail();
      if (!room.subject) {
        alert('⚠️ Failed to generate room booking email. Please check guest information.');
        return null;
      }
      subject = room.subject;
      combinedBody = room.body;
    }
    
    if (booking.selectedServices.has('car')) {
      services.push('Car');
      const car = generateCarEmail();
      if (combinedBody) {
        combinedBody += '\n\n---\n\n' + car.body;
      } else {
        combinedBody = car.body;
        subject = car.subject;
      }
    }
    
    if (booking.selectedServices.has('golf')) {
      services.push('Golf');
      const golf = generateGolfEmail();
      if (combinedBody) {
        combinedBody += '\n\n---\n\n' + golf.body;
      } else {
        combinedBody = golf.body;
        subject = golf.subject;
      }
    }
    
    if (booking.selectedServices.has('bus') && !booking.selectedServices.has('room')) {
      services.push('Bus');
      const bus = generateBusEmail();
      if (combinedBody) {
        combinedBody += '\n\n---\n\n' + bus.body;
      } else {
        combinedBody = bus.body;
        subject = bus.subject;
      }
    }
    
    // 组合服务标题
    if (services.length > 1 && (booking.selectedServices.has('room') || booking.selectedServices.has('golf'))) {
      let firstGuestPID = '';
      let firstGuestName = '';
      let checkInDate = '';
      
      if (booking.selectedServices.has('room') && booking.roomBooking) {
        // V2.0.41: 找到第一个有效客人
        const validGuest = booking.roomBooking.guests.find(g => g.name);
        if (validGuest) {
          firstGuestPID = resolvePID(validGuest.oldPID || '', validGuest.newPID || '');
          firstGuestName = validGuest.name;
          checkInDate = formatDate(booking.roomBooking.checkIn);
        }
      } else if (booking.selectedServices.has('golf') && booking.golfBooking) {
        const g = booking.golfBooking.guests[0];
        if (g) {
          firstGuestPID = resolvePID(g?.oldPID || '', g?.newPID || '');
          firstGuestName = g?.name || '';
          checkInDate = formatDateShort(booking.golfBooking.dateTime?.split('T')[0] || '');
        }
      }
      
      const agent = booking.roomBooking?.agent || booking.golfBooking?.authorizer || '';
      if (firstGuestName) {
        subject = `[${agent}] ${firstGuestPID} ${firstGuestName} ${services.join(' + ')} Booking on ${checkInDate}`;
      }
    }
    
    return {
      email: `Subject: ${subject}\n\n${combinedBody}`,
      subject,
      isOneDayTrip: false,
    };
  };
  
  return { generateAllEmails };
}
