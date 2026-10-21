import { useEffect, useState } from 'react';
import { usableEvidence } from '../../engine/availability';
import { formatShortDate, formatTime12 } from '../../engine/format';
import type { EvidenceOfType } from '../../engine/types';
import { useProgress } from '../../stores/progressStore';
import { Button } from '../../ui/Button';
import { Icon } from '../../ui/Icon';
import type { AppProps } from '../registry';
import { PinButton } from '../shared/PinButton';
import { HashLine } from '../shared/HashLine';
import { openEvidence, useCaseState } from '../shared/hooks';
import s from '../shared/shared.module.css';
import f from './social.module.css';

type Post = EvidenceOfType<'socialPost'>;
type Photo = EvidenceOfType<'photo'>;

/** Social feed: posts, check-ins and comments, with a compare view for cropped images. */
export default function SocialApp({ params }: AppProps) {
  const { c, progress, caseId } = useCaseState();
  const usable = usableEvidence(c, progress);
  const posts = usable
    .filter((e): e is Post => e.type === 'socialPost')
    .sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt));

  // Reading the feed counts as viewing every post on it.
  const postIds = posts.map((p) => p.id).join(',');
  useEffect(() => {
    for (const id of postIds.split(',').filter(Boolean))
      useProgress.getState().markViewed(caseId, id);
  }, [postIds, caseId]);

  if (!posts.length)
    return (
      <div className={s.empty}>
        <Icon name="feed" size={40} />
        <p>No social posts collected yet.</p>
      </div>
    );

  return (
    <div className={`${s.main} ${f.feed}`}>
      {posts.map((p) => (
        <PostCard
          key={p.id}
          post={p}
          original={usable.find(
            (e): e is Photo => e.id === p.originalEvidenceId && e.type === 'photo',
          )}
          highlight={params.selected === p.id}
          offset={c.timeZone.utcOffset}
        />
      ))}
      <p className={s.prompt}>
        <strong>Think:</strong> a post’s time is when it was <em>posted</em>, which isn’t always
        when the photo was taken. And a posted image may have been cropped.
      </p>
    </div>
  );
}

function PostCard({
  post,
  original,
  highlight,
  offset,
}: {
  post: Post;
  original: Photo | undefined;
  highlight: boolean;
  offset: string;
}) {
  const [compare, setCompare] = useState(false);
  return (
    <article
      className={`${f.post} ${highlight ? f.highlight : ''}`}
      aria-labelledby={`post-${post.id}`}
    >
      <header className={f.postHead}>
        <span className={f.avatar} aria-hidden="true">
          {post.author[0]}
        </span>
        <div>
          <strong id={`post-${post.id}`}>{post.author}</strong>{' '}
          <span className={f.handle}>
            {post.handle} · {post.platform}
          </span>
          <div className={f.time}>
            Posted {formatShortDate(post.postedAt, offset)}, {formatTime12(post.postedAt, offset)}
            {post.checkIn && (
              <>
                {' · '}
                <Icon name="mapPin" size={12} className="inline-icon" /> {post.checkIn}
              </>
            )}
          </div>
        </div>
        <div className={f.actions}>
          <PinButton evidenceId={post.id} />
        </div>
      </header>
      <p className={f.body}>{post.body}</p>
      {post.image && !compare && (
        <img className={f.image} src={post.image.src} alt={post.image.alt} />
      )}
      {post.image && compare && original && (
        <div className={f.compare}>
          <figure>
            <img src={post.image.src} alt={post.image.alt} />
            <figcaption>As posted</figcaption>
          </figure>
          <figure>
            <img src={original.src} alt={original.alt} />
            <figcaption>
              Original file ·{' '}
              <button type="button" className={f.linkButton} onClick={() => openEvidence(original)}>
                open in Photos for its metadata
              </button>
            </figcaption>
          </figure>
        </div>
      )}
      {post.image && original && (
        <Button
          size="small"
          icon="eye"
          aria-pressed={compare}
          onClick={() => setCompare((v) => !v)}
        >
          {compare ? 'Hide original' : 'Compare with the original photo'}
        </Button>
      )}
      {post.comments?.length ? (
        <ul className={f.comments} aria-label="Comments">
          {post.comments.map((cm, i) => (
            <li key={i}>
              <strong>{cm.author}</strong> {cm.body}
              <span className={f.time}> · {formatTime12(cm.at, offset)}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <HashLine item={post} />
    </article>
  );
}
