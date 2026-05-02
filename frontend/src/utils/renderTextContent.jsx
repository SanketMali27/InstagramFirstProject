import { Link } from 'react-router-dom';

const tokenRegex = /([#@][a-zA-Z0-9._]+)/g;

export const renderTextContent = (text = '') =>
  text.split(tokenRegex).map((part, index) => {
    if (part.startsWith('#')) {
      const tag = part.slice(1);
      return (
        <Link key={`${part}-${index}`} to={`/explore/hashtag/${tag}`} className="font-semibold text-sky-600">
          {part}
        </Link>
      );
    }

    if (part.startsWith('@')) {
      const username = part.slice(1);
      return (
        <Link key={`${part}-${index}`} to={`/userprofile/${username}/${username}`} className="font-semibold text-sky-600">
          {part}
        </Link>
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
