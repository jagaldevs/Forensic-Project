/**
 * Plain-English checks of an email's headers, for the "Header check" panel. Each check has
 * an icon and a text label as well as a tone, so nothing relies on colour alone.
 */
import type { EvidenceOfType } from '../../engine/types';
import type { IconName } from '../../ui/Icon';
import type { StatusKind } from '../../ui/labels';
import { domainOf, sameOrganisation } from './rawSource';

type Email = EvidenceOfType<'email'>;

export interface HeaderCheck {
  id: string;
  tone: StatusKind | 'info';
  icon: IconName;
  label: string;
  text: string;
}

function replyToCheck(email: Email, fromDomain: string): HeaderCheck {
  const reply = email.replyTo;
  if (!reply)
    return {
      id: 'reply-to',
      tone: 'supports',
      icon: 'check',
      label: 'Replies go to the sender',
      text: 'There is no separate Reply-To, so a reply goes back to the From address.',
    };
  if (sameOrganisation(domainOf(reply.address), fromDomain))
    return {
      id: 'reply-to',
      tone: 'supports',
      icon: 'check',
      label: 'Reply-To matches',
      text: `Replies go to ${reply.address}, which is on the same domain as the From address.`,
    };
  return {
    id: 'reply-to',
    tone: 'inconclusive',
    icon: 'alert',
    label: 'Warning: replies go somewhere else',
    text: `Replies go somewhere else: ${reply.address}, not ${email.from.address}. Anyone who answers this email is really writing to that address.`,
  };
}

function spfCheck(email: Email, fromDomain: string): HeaderCheck {
  switch (email.auth.spf) {
    case 'pass':
      return {
        id: 'spf',
        tone: 'supports',
        icon: 'supports',
        label: 'SPF: pass',
        text: `The sending server is on ${fromDomain}'s list of servers allowed to send its mail.`,
      };
    case 'fail':
      return {
        id: 'spf',
        tone: 'contradicts',
        icon: 'contradicts',
        label: 'SPF: fail',
        text: `The sending server is not on ${fromDomain}'s list of servers allowed to send its mail.`,
      };
    case 'softfail':
      return {
        id: 'spf',
        tone: 'inconclusive',
        icon: 'alert',
        label: 'SPF: soft fail',
        text: `${fromDomain} says this server probably should not send its mail, but asks for it to be delivered anyway.`,
      };
    case 'none':
      return {
        id: 'spf',
        tone: 'unassessed',
        icon: 'unassessed',
        label: 'SPF: none',
        text: `${fromDomain} publishes no list of allowed servers, so this check cannot tell either way.`,
      };
  }
}

function dkimCheck(email: Email): HeaderCheck {
  switch (email.auth.dkim) {
    case 'pass':
      return {
        id: 'dkim',
        tone: 'supports',
        icon: 'supports',
        label: 'DKIM: pass',
        text: 'The email carries a valid digital signature from the sending domain, so it was not changed on the way.',
      };
    case 'fail':
      return {
        id: 'dkim',
        tone: 'contradicts',
        icon: 'contradicts',
        label: 'DKIM: fail',
        text: 'The digital signature does not match: the email was changed on the way, or the signature is not genuine.',
      };
    case 'none':
      return {
        id: 'dkim',
        tone: 'unassessed',
        icon: 'unassessed',
        label: 'DKIM: none',
        text: 'There is no digital signature, so nothing confirms which domain really sent it.',
      };
  }
}

function originCheck(email: Email, fromDomain: string): HeaderCheck {
  const first = email.received.at(-1)!;
  const belongs = sameOrganisation(domainOf(first.from), fromDomain);
  return {
    id: 'origin',
    tone: belongs ? 'info' : 'inconclusive',
    icon: belongs ? 'mapPin' : 'alert',
    label: 'Where it really started',
    text: `The oldest Received line (the bottom one) shows the email entered the mail system from ${first.from} [${first.fromIp}]${belongs ? `, a server belonging to ${fromDomain}.` : `, which is not part of ${fromDomain}.`}`,
  };
}

function messageIdCheck(email: Email, fromDomain: string): HeaderCheck {
  const idDomain = domainOf(email.messageId);
  if (sameOrganisation(idDomain, fromDomain))
    return {
      id: 'message-id',
      tone: 'supports',
      icon: 'check',
      label: 'Message-ID matches',
      text: `The Message-ID was made by ${idDomain}, the same domain as the From address.`,
    };
  return {
    id: 'message-id',
    tone: 'inconclusive',
    icon: 'alert',
    label: 'Message-ID from elsewhere',
    text: `The Message-ID was made by ${idDomain}, not ${fromDomain}. The system that really sends an email usually stamps its own name here.`,
  };
}

export function headerChecks(email: Email): HeaderCheck[] {
  const fromDomain = domainOf(email.from.address);
  const checks = [
    replyToCheck(email, fromDomain),
    spfCheck(email, fromDomain),
    dkimCheck(email),
    originCheck(email, fromDomain),
    messageIdCheck(email, fromDomain),
  ];
  if (email.auth.detail)
    checks.push({
      id: 'detail',
      tone: 'info',
      icon: 'info',
      label: 'Mail server note',
      text: email.auth.detail,
    });
  return checks;
}
