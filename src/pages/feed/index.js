/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'

import { FixedSizeGrid as Grid } from 'react-window'
import InfiniteLoader from 'react-window-infinite-loader'
import AutoSizer from 'react-virtualized-auto-sizer'

import { GetFeed, GethDAOFeed } from '../../data/api'
import { Page, Container, Padding } from '../../components/layout'
import { FeedItem } from '../../components/feed-item'
import { Loading } from '../../components/loading'
import { Button, Primary } from '../../components/button'
import styles from './index.module.scss'

export const Feed = () => {
  const [error, setError] = useState(false)
  const [feedType, setFeedType] = useState(1)
  const [items, setItems] = useState([])
  const [count, setCount] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  console.log('feed av')

  const loadMore = () => {
    setCount(count + 1)
  }

  useEffect(() => {
    console.log('use effect')

    if (error) {
      console.log('returning on error')
      return
    }

    if (feedType === 0) {
      console.log('hDAO feed')

      // api
      GethDAOFeed({ counter: count })
        .then((result) => {
          const next = items.concat(result)
          setItems(next)

          if (result.length < 10) {
            setHasMore(false)
          }
        })
        .catch((e) => {
          setError(true)
        })
    } else {
      console.log('latest feed')

      // api
      GetFeed({ counter: count })
        .then(({ filtered, original }) => {
          // filtered isn't guaranteed to always be 10. if we're filtering they might be less.
          const next = items.concat(filtered)
          setItems(next)
          console.log(filtered)
          // if original returns less than 10, then there's no more data coming from API
          if (original.length < 30) {
            setHasMore(false)
          }
        })
        .catch((e) => {
          setError(true)
        })
    }
  }, [count, feedType])

  const toggleFeed = (index) => {
    setFeedType(index)
    setCount(0)
    setItems([])
    setHasMore(true)
  }

  const columnCount = 3
  const itemCount = hasMore ? items.length + 1 : items.length
  const isItemLoaded = (index) => !hasMore || index < items.length

  // Render an item or a loading indicator.
  const Item = ({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * columnCount + columnIndex

    let content
    if (!isItemLoaded(index)) {
      content = (
        <Container>
          <Padding>
            <div className={styles.container}>
              <Loading />
            </div>
          </Padding>
        </Container>
      )
    } else {
      const item = items[index]
      content = <FeedItem key={`${item.token_id}-${index}`} {...item} />
    }

    return <div style={style}>{content}</div>
  }

  return (
    <Page>
      {false && (
        <div className={styles.sticky}>
          <div className={styles.content}>
            <Button onClick={() => toggleFeed(0)}>
              <Primary selected={feedType === 0}>hDAO</Primary>
            </Button>
            <Button onClick={() => toggleFeed(1)}>
              <Primary selected={feedType === 1}>latest</Primary>
            </Button>
          </div>
        </div>
      )}
      <AutoSizer>
        {({ height, width }) => (
          <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={itemCount}
            loadMoreItems={
              () => console.log('this aint workin') // loadMore
            }
          >
            {({ onItemsRendered, ref }) => (
              <Grid
                columnCount={columnCount}
                columnWidth={230}
                height={height}
                rowCount={itemCount}
                rowHeight={300}
                width={width}
              >
                {Item}
              </Grid>
            )}
          </InfiniteLoader>
        )}
      </AutoSizer>
    </Page>
  )
}

// <List
//   className="List"
//   height={height}
//   itemCount={itemCount}
//   itemSize={500}
//   onItemsRendered={onItemsRendered}
//   ref={ref}
//   width={width}
// >
//   {Item}
// </List>
