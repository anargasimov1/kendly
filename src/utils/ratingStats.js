export const buildRatingStats = (reviews = []) => {
  const total_reviews = reviews.length;
  let average_rating = 0;
  const rating_distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const rating_percentages = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  if (total_reviews > 0) {
    let sum = 0;
    reviews.forEach((review) => {
      const rating = review.rating;
      sum += rating;
      if (rating_distribution[rating] !== undefined) {
        rating_distribution[rating] += 1;
      }
    });
    average_rating = Number((sum / total_reviews).toFixed(1));

    for (let star = 1; star <= 5; star++) {
      rating_percentages[star] = Number(((rating_distribution[star] / total_reviews) * 100).toFixed(1));
    }
  }

  return {
    total_reviews,
    average_rating,
    rating_distribution,
    rating_percentages,
  };
};
